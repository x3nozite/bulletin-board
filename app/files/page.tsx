import ProtectedPage from "../components/protectedPage";
import RoomList from "./roomList";

export default async function page() {
  return (
    <ProtectedPage>
      <RoomList></RoomList>
    </ProtectedPage>
  );
}
