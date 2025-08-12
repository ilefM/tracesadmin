import DataTable from "../components/DataTable";
import SearchBar from "../components/SearchBar";

export default function Home() {
  return (
    <div className="space-y-10">
      <DataTable />
      <SearchBar />
    </div>
  );
}
