"use client";
import UserHome from "@/components/Home/LandingPages/UserHome";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserFromCookies } from "./lib/action/auth";

export default function Home() {
  const [users, setUsers] = useState<any>({});
  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      console.log(decodeUser, "decoded user");
      setUsers(decodeUser.user);
    };
    fetchData();
    if (users) {
      window.location.reload();
    }
  }, []);
  return (
    <div>
      <UserHome />
    </div>
  );
}
