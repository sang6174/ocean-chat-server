import type { HttpResponse } from "../types";
import { pgGetParticipantRole, pgAddParticipantsTransaction } from "../models";

export async function addParticipantsService(
  conversationId: string,
  userId: string,
  participantIds: string[]
): Promise<HttpResponse | null> {
  try {
    const userRole = await pgGetParticipantRole(userId, conversationId);
    if (!userRole) {
      return {
        status: 403,
        message: "Only group admins can add new members.",
      };
    }

    const result = await pgAddParticipantsTransaction(
      conversationId,
      participantIds
    );
    if (!result) {
      return {
        status: 500,
        message: "Save all new participants into database error.",
      };
    }

    return {
      status: 201,
      message: "Add participants successfully.",
    };
  } catch (err) {
    console.log("Add participants services error: ", err);
    return null;
  }
}
