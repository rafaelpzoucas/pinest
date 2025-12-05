import { SignOutButton } from "@/app/(protected)/(app)/config/(options)/account/sign-out";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/server";
import { SidebarFooter } from "../ui/sidebar";
import { UserCard } from "./user-card";

export async function Footer() {
  const supabase = createClient();
  const { data: userData, error: userDataError } =
    await supabase.auth.getUser();

  if (userDataError) {
    console.error(userDataError);
  }

  const metadata = userData.user?.user_metadata;

  return (
    <SidebarFooter>
      <Popover>
        <PopoverTrigger>
          <UserCard metadata={metadata} />
        </PopoverTrigger>
        <PopoverContent align="start">
          <SignOutButton />
        </PopoverContent>
      </Popover>
    </SidebarFooter>
  );
}
