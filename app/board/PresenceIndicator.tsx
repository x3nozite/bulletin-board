"use client";

import { usePresenceStore } from "../store/usePresenceStore";

export function PresenceIndicator() {
  const profiles = usePresenceStore((s) => s.profiles);

  const onlineUsers = Object.values(profiles).filter((p) => p.active);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {onlineUsers.map((user) => (
        <div
          key={crypto.randomUUID()}
          title={user.name ?? "Anonymous"}
          className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex items-center justify-center -ml-2 first:ml-0"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium text-gray-700">
              {(user.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
      ))}
      <span className="text-sm text-gray-500 ml-2">
        {onlineUsers.length} online
      </span>
    </div>
  );
}
