"use client";
import * as React from "react";
// components
import { DropdownMenu } from "./dropdown-menu";
import { Avatar } from "./avatar";
import { GearIcon, PersonIcon, SignOutIcon } from "@primer/octicons-react";

// utils
import { useRouter } from "next/navigation";
import { logoutUser } from "~/app/(actions)/auth";

// types
export type UserDropdownProps = {
  avatar_url: string;
  username: string;
};

export function UserDropdown({ avatar_url, username }: UserDropdownProps) {
  const router = useRouter();
  return (
    <DropdownMenu
      className="min-w-fit flex items-center"
      items={[
        {
          href: "/profile",
          text: "Your profile",
          icon: PersonIcon,
        },
        {
          href: "/profile/settings",
          text: "Settings",
          icon: GearIcon,
        },
        {
          text: "Sign out",
          icon: SignOutIcon,
          onClick: async () => {
            React.startTransition(
              () =>
                void logoutUser().then(() => {
                  router.refresh();
                })
            );
          },
        },
      ]}
    >
      <button type="button">
        <Avatar username={username} src={avatar_url}  />
      </button>
    </DropdownMenu>
  );
}
