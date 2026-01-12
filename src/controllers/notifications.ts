import type {
  FriendRequestDomainInput,
  FriendRequestWithNotificationIdDomainInput,
} from "../types/domain";
import {
  sendFriendRequestService,
  getNotificationsService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  markNotificationsAsReadService,
} from "../services/notifications";

export async function sendFriendRequestController(
  input: FriendRequestDomainInput
) {
  const result = await sendFriendRequestService(input);

  return result;
}

export async function getNotificationsController(input: { userId: string }) {
  const result = await getNotificationsService(input);

  return result;
}

export async function cancelFriendRequestController(
  input: FriendRequestWithNotificationIdDomainInput
) {
  const result = await cancelFriendRequestService(input);

  return result;
}

export async function acceptFriendRequestController(
  input: FriendRequestWithNotificationIdDomainInput
) {
  const result = await acceptFriendRequestService(input);

  return result;
}

export async function rejectFriendRequestController(
  input: FriendRequestWithNotificationIdDomainInput
) {
  const result = await rejectFriendRequestService(input);

  return result;
}

export async function markNotificationsAsReadController(input: {
  userId: string;
}) {
  const result = await markNotificationsAsReadService(input);

  return result;
}
