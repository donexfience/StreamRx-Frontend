"use client";
import UserHome from "@/components/Home/LandingPages/UserHome";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserFromCookies } from "./lib/action/auth";

export default function Home() {
  const [users, setUsers] = useState<any>(null);
  const [hasReloaded, setHasReloaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      console.log(decodeUser, "decoded user");
      setUsers(decodeUser?.user);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (users && !hasReloaded) {
      setHasReloaded(true);
      window.location.reload();
    }
  }, [users, hasReloaded]);
  return (
    <div>
      <UserHome />
    </div>
  );
}
