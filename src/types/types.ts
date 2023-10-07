type User = {
  id: string;
  name: string;
  email: string;
  image: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
};

type UnseenMessage = Message & {
  chatId: string;
};

type Chat = {
  id: string;
  users: User[];
  name: string;
};
