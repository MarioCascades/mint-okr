import { supabase } from "@/lib/supabase";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{user.full_name}</h1>
      <p>Role: {user.role}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}