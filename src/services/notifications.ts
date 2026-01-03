import {
  NotificationStatusType,
  NotificationType,
  WsServerEvent,
  type FriendRequestDomainInput,
  type FriendRequestWithNotificationIdDomainInput,
  type SendFriendRequestRepositoryOutput,
  type AcceptFriendRequestRepositoryOutput,
  type ResponseDomain,
  type GetNotificationRepositoryOutput,
} from "../types/domain";
import {
  createFriendRequestRepository,
  getNotificationsRepository,
  cancelFriendRequestRepository,
  acceptFriendRequestRepository,
  denyFriendRequestRepository,
  findAccountByUserId,
  getNotificationByIdRepository,
  markNotificationsAsReadRepository,
} from "../repository";
import { eventBusServer } from "../websocket/events";
import { DomainError } from "../helpers/errors";

export async function sendFriendRequestService(
  input: FriendRequestDomainInput
): Promise<SendFriendRequestRepositoryOutput> {
  const result = await createFriendRequestRepository({
    type: NotificationType.FRIEND_REQUEST,
    status: NotificationStatusType.PENDING,
    content: `${input.sender.username} sent you a friend request`,
    ...input,
  });

  eventBusServer.emit(WsServerEvent.NOTIFICATION_FRIEND_REQUEST, {
    ...input,
    data: result,
  });

  return result;
}

export async function getNotificationsService(input: {
  userId: string;
}): Promise<GetNotificationRepositoryOutput[]> {
  const result = await getNotificationsRepository({
    userId: input.userId,
  });

  return result;
}

export async function cancelFriendRequestService(
  input: FriendRequestWithNotificationIdDomainInput
): Promise<ResponseDomain> {
  const result = await cancelFriendRequestRepository({
    id: input.notificationId,
    status: NotificationStatusType.CANCELLED,
  });

  eventBusServer.emit(WsServerEvent.NOTIFICATION_CANCELLED_FRIEND_REQUEST, {
    ...input,
    data: result,
  });

  return {
    status: 201,
    code: "CANCEL_NOTIFICATION_SUCCESS",
    message: "Cancel friend request is successful",
  };
}

export async function acceptFriendRequestService(
  input: FriendRequestWithNotificationIdDomainInput
): Promise<AcceptFriendRequestRepositoryOutput> {
  const notification = await getNotificationByIdRepository(
    input.notificationId
  );

  if (!notification) {
    throw new DomainError({
      status: 404,
      code: "NOTIFICATION_NOT_FOUND",
      message: "Notification not found",
    });
  }

  if (notification.recipientId !== input.sender.id) {
    throw new DomainError({
      status: 403,
      code: "FORBIDDEN",
      message: "You are not allowed to accept this friend request",
    });
  }

  const senderAccount = await findAccountByUserId({
    userId: notification.senderId,
  });

  if (!senderAccount) {
    throw new DomainError({
      status: 404,
      code: "SENDER_NOT_FOUND",
      message: "Sender account not found",
    });
  }

  const sender = {
    id: senderAccount.userId,
    username: senderAccount.username,
  };

  const recipient = {
    id: input.sender.id,
    username: input.sender.username,
  };

  const result = await acceptFriendRequestRepository({
    FriendRequest: {
      id: notification.id,
      status: NotificationStatusType.ACCEPTED,
    },
    AcceptedFriendRequest: {
      type: NotificationType.ACCEPTED_FRIEND_REQUEST,
      status: NotificationStatusType.ACCEPTED,
      content: `${recipient.username} accepted your friend request`,
      sender: recipient,
      recipient: sender,
    },
  });

  console.log(result);

  eventBusServer.emit(WsServerEvent.NOTIFICATION_ACCEPTED_FRIEND_REQUEST, {
    sender: recipient,
    recipient: sender,
    data: result,
  });

  return result;
}

export async function denyFriendRequestService(
  input: FriendRequestWithNotificationIdDomainInput
): Promise<ResponseDomain> {
  const notification = await getNotificationByIdRepository(
    input.notificationId
  );

  if (!notification) {
    throw new DomainError({
      status: 404,
      code: "NOTIFICATION_NOT_FOUND",
      message: "Notification not found",
    });
  }

  if (notification.recipientId !== input.sender.id) {
    throw new DomainError({
      status: 403,
      code: "FORBIDDEN",
      message: "You are not allowed to deny this friend request",
    });
  }

  const senderAccount = await findAccountByUserId({
    userId: notification.senderId,
  });
  if (!senderAccount) {
    throw new DomainError({
      status: 404,
      code: "SENDER_NOT_FOUND",
      message: "Sender account not found",
    });
  }

  const sender = {
    id: senderAccount.userId,
    username: senderAccount.username,
  };

  const recipient = {
    id: input.sender.id,
    username: input.sender.username,
  };

  const result = await denyFriendRequestRepository({
    FriendRequest: {
      id: notification.id,
      status: NotificationStatusType.REJECTED,
    },
    RejectedFriendRequest: {
      type: NotificationType.DENIED_FRIEND_REQUEST,
      status: NotificationStatusType.REJECTED,
      content: `${recipient.username} rejected your friend request`,
      sender: recipient,
      recipient: sender,
    },
  });

  eventBusServer.emit(WsServerEvent.NOTIFICATION_DENIED_FRIEND_REQUEST, {
    sender: recipient,
    recipient: sender,
    data: result,
  });

  return {
    status: 201,
    code: "SEND_NOTIFICATION_SUCCESS",
    message: "Deny friend request is successful",
  };
}

export async function markNotificationsAsReadService(input: {
  userId: string;
}): Promise<ResponseDomain> {
  await markNotificationsAsReadRepository(input);

  return {
    status: 200,
    code: "MARK_READ_SUCCESS",
    message: "Notifications marked as read successfully",
  };
}
