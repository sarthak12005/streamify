import React from 'react'
import { useThemeStore } from "../store/useThemeStore.js"
import { useParams } from 'react-router'
import { useState } from 'react';
import useAuthUser from '../hooks/useAuthUser.js';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api.js';
import toast from 'react-hot-toast';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import { useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import ChatLoader from '../components/ChatLoader.jsx';
import CallButton from '../components/CallButton.jsx';
import ClearMessageButton from '../components/ClearMessageButton.jsx';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is defined
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing strean chat client...");
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);

      } catch (error) {
        console.error("Error initializing chat", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully");
    }
  };

  const handleClearChat = async () => {
    if (!channel) return;

    try {
      await channel.truncate(); // clears all messages
      toast.success("Chat cleared successfully!");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat. Please try again.");
    }
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />
  }

  return (
    <div className='h-[93vh]'>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative ">

            <CallButton handleVideoCall={handleVideoCall} />
            <ClearMessageButton handleClearChat={handleClearChat} />

            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage
