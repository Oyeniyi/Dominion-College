/**
 * Domain Authorization, Role Matrix, and Lifecycle State Machines
 * Adheres to AE-04, AE-18, SEC-02, SEC-16, and TASK-004/TASK-006.
 */

import {
  AdminRoleCode,
  AdminActor,
  EnquiryStatus,
  Permission,
  PublicationStatus,
} from './types';
import { AuthorizationError, ConflictError, ValidationError } from './errors';

export const ROLE_PERMISSION_MATRIX: Record<AdminRoleCode, readonly Permission[]> = {
  administrator: [
    'dashboard:read',
    'enquiries:read',
    'enquiries:update',
    'content:read',
    'content:create',
    'content:update',
    'content:publish',
    'content:delete',
    'gallery:read',
    'gallery:upload',
    'gallery:update',
    'gallery:publish',
    'gallery:delete',
    'settings:read',
    'settings:update',
    'users:read',
    'users:create',
    'users:update',
  ],
};

export function getPermissionsForRole(roleCode: AdminRoleCode): Permission[] {
  const perms = ROLE_PERMISSION_MATRIX[roleCode];
  return perms ? [...perms] : [];
}

/**
 * Server-side fail-closed authorization check (AE-04, SEC-02).
 * Rejects null users, inactive accounts, unknown roles, and missing permissions.
 */
export function assertAuthorized(
  user: AdminActor | null | undefined,
  requiredPermission: Permission
): void {
  if (!user || !user.id) {
    throw new AuthorizationError('Active authenticated administrator context is required.');
  }
  if (!user.isActive) {
    throw new AuthorizationError('This administrator account is disabled.');
  }
  const permissions = ROLE_PERMISSION_MATRIX[user.roleCode];
  if (!permissions || !permissions.includes(requiredPermission)) {
    throw new AuthorizationError(`Missing required permission: ${requiredPermission}`);
  }
}

const ALLOWED_ENQUIRY_TRANSITIONS: Record<EnquiryStatus, readonly EnquiryStatus[]> = {
  new: ['new', 'contacted', 'resolved', 'archived'],
  contacted: ['contacted', 'resolved', 'archived', 'new'],
  resolved: ['resolved', 'contacted', 'archived'],
  archived: ['archived', 'contacted', 'resolved'],
};

export function assertValidEnquiryStatusTransition(
  currentStatus: EnquiryStatus,
  nextStatus: EnquiryStatus
): void {
  const allowed = ALLOWED_ENQUIRY_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new ConflictError(
      `Invalid enquiry status transition from '${currentStatus}' to '${nextStatus}'.`
    );
  }
}

const ALLOWED_PUBLICATION_TRANSITIONS: Record<PublicationStatus, readonly PublicationStatus[]> = {
  draft: ['draft', 'published', 'archived'],
  published: ['published', 'unpublished', 'archived'],
  unpublished: ['unpublished', 'draft', 'published', 'archived'],
  archived: ['archived', 'draft', 'unpublished'],
};

export function assertValidPublicationTransition(
  currentStatus: PublicationStatus,
  nextStatus: PublicationStatus
): void {
  const allowed = ALLOWED_PUBLICATION_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new ConflictError(
      `Invalid publication status transition from '${currentStatus}' to '${nextStatus}'.`
    );
  }
}

/**
 * Enforces SEC-09 / SEC-16 / FR-07 child protection & media approval rule:
 * An image cannot be published unless schoolApproved is true, and if identifiableStudents is true,
 * a verifiable approvalReference must be provided.
 */
export function assertGalleryImagePublishable(input: {
  status: PublicationStatus;
  schoolApproved: boolean;
  identifiableStudents: boolean;
  approvalReference: string | null | undefined;
}): void {
  if (input.status !== 'published') {
    return;
  }

  if (!input.schoolApproved) {
    throw new ValidationError(
      'Gallery images require explicit school management approval before publication.',
      [
        {
          field: 'schoolApproved',
          code: 'APPROVAL_REQUIRED',
          message: 'Confirm school approval before setting status to published.',
        },
      ]
    );
  }

  if (
    input.identifiableStudents &&
    (!input.approvalReference || input.approvalReference.trim().length < 3)
  ) {
    throw new ValidationError(
      'Identifiable student photographs require a recorded school authorization reference before publication.',
      [
        {
          field: 'approvalReference',
          code: 'STUDENT_MEDIA_CONSENT_REQUIRED',
          message:
            'Enter the school authorization/consent reference before publishing identifiable student photographs.',
        },
      ]
    );
  }
}
