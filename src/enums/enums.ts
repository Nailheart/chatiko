/**
 * Pusher channel naming conventions
 *
 * @see https://pusher.com/docs/channels/using_channels/channels/#channel-naming-conventions
 */

enum PusherChannel {
  INCOMING_FRIEND_REQUESTS_ID = 'incoming_friend_requests',
  INCOMING_FRIEND_REQUEST_USER_ID = 'incoming_friend_request_user',
  NEW_CHAT_ID = 'new_chat',
  CHAT_ID = 'chat',
  CHAT_UNSEEN_MESSAGE = 'unseen_message',
  CHAT_DELETE_ID = 'chat_delete',
}

enum PusherEvent {
  INCOMING_FRIEND_REQUESTS = 'incoming_friend_requests',
  INCOMING_FRIEND_REQUEST_USER = 'incoming_friend_request_user',
  ACECEPT_FRIEND_REQUEST = 'accept_friend_request',
  REJECT_FRIEND_REQUEST = 'reject_friend_request',
  NEW_CHAT = 'new_chat',
  SEND_MESSAGE = 'send_message',
  UNSEEN_MESSAGE = 'unseen_message',
  CHAT_DELETE = 'chat_delete',
}

export { PusherChannel, PusherEvent };