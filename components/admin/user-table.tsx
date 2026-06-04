"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Profile, UserRole } from "@/types/database.types";

interface UserTableProps {
  users: Profile[];
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "관리자",
  host: "호스트",
  member: "일반",
};

const ROLE_VARIANT: Record<
  UserRole,
  "default" | "secondary" | "destructive" | "outline"
> = {
  admin: "destructive",
  host: "default",
  member: "secondary",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>아이디</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>가입일</TableHead>
          <TableHead className="w-20">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {user.full_name ?? "-"}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {user.username ?? "-"}
            </TableCell>
            <TableCell>
              <Badge variant={ROLE_VARIANT[user.role]}>
                {ROLE_LABEL[user.role]}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(user.created_at)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    역할 변경
                    <ChevronDown size={12} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>관리자로 변경</DropdownMenuItem>
                  <DropdownMenuItem>호스트로 변경</DropdownMenuItem>
                  <DropdownMenuItem>일반으로 변경</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
