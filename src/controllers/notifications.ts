import type {
  FriendRequestDomainInput,
  FriendRequestWithNotificationIdDomainInput,
} from "../types/domain";
import {
  sendFriendRequestService,
  getNotificationsService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  denyFriendRequestService,
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

export async function denyFriendRequestController(
  input: FriendRequestWithNotificationIdDomainInput
) {
  const result = await denyFriendRequestService(input);

  return result;
}
