"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="mt-20">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="mt-20 text-center">You are not signed in.</div>;
  }

  const { name, email, image } = session.user;

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      {image && (
        <Image
          src={image}
          alt="User profile image"
          width={96}
          height={96}
          className="rounded-full border-4 border-neutral-200 dark:border-neutral-700"
        />
      )}
      <div className="text-xl font-semibold mt-2">{name}</div>
      <div className="text-neutral-500">{email}</div>
      <div className="mt-4 text-sm text-neutral-400">Welcome to your profile page.</div>
    </div>
  );
} 