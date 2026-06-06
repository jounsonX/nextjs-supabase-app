import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/user-table";
import { getUsers } from "@/app/protected/admin/actions";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">사용자 관리</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            가입자 목록 ({users.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
