import { useState } from "react";

type Document = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

type Props = {
  data: Document[];
};

export default function DocumentTable({ data }: Props) {
  const [filterStatus, setFilterStatus] = useState<"All" | "Done" | "In Process">("All");

  const filteredData =
    filterStatus === "All"
      ? data
      : data.filter((item) => item.status === filterStatus);

  const doneCount = data.filter((item) => item.status === "Done").length;
  const totalCount = data.length;
  const donePercentage = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Document Progress</h2>
        <div className="flex gap-2">
          {["All", "Done", "In Process"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1 rounded-md text-sm ${
                filterStatus === status
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500"
          style={{ width: `${donePercentage}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {doneCount} of {totalCount} documents completed ({donePercentage}%)
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Header</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2 text-left">Limit</th>
              <th className="p-2 text-left">Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-2">{doc.header}</td>
                <td className="p-2">{doc.type}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      doc.status === "Done"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="p-2">{doc.target}</td>
                <td className="p-2">{doc.limit}</td>
                <td className="p-2">{doc.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
