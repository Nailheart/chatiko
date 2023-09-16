type User = {
  name: string;
  email: string;
  image: string;
  id: string;
}

type Chat = {
  id: string;
  messages: Message[];
}

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
}
