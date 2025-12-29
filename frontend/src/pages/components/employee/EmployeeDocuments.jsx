import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Upload,
  File,
  Calendar,
  Search,
} from "lucide-react";

const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Offer Letter",
      type: "PDF",
      size: "2.4 MB",
      date: "2024-01-15",
      category: "Employment",
    },
    {
      id: 2,
      name: "Appointment Letter",
      type: "PDF",
      size: "1.8 MB",
      date: "2024-01-20",
      category: "Employment",
    },
    {
      id: 3,
      name: "January 2024 Payslip",
      type: "PDF",
      size: "1.2 MB",
      date: "2024-02-05",
      category: "Payslip",
    },
    {
      id: 4,
      name: "NDA Agreement",
      type: "DOC",
      size: "3.1 MB",
      date: "2024-01-10",
      category: "Legal",
    },
    {
      id: 5,
      name: "Health Insurance",
      type: "PDF",
      size: "4.2 MB",
      date: "2024-01-25",
      category: "Benefits",
    },
  ]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setDocuments([
          ...documents,
          {
            id: documents.length + 1,
            name: file.name,
            type: file.type.split("/")[1].toUpperCase(),
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: new Date().toISOString().split("T")[0],
            category: "Personal",
          },
        ]);
        setUploading(false);
        alert("Document uploaded successfully!");
      }, 1500);
    }
  };

  const categories = [
    "All",
    "Employment",
    "Payslip",
    "Legal",
    "Benefits",
    "Personal",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDocuments =
    selectedCategory === "All"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="cursor-pointer">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Document
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
          </label>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  doc.category === "Payslip"
                    ? "bg-green-100 text-green-800"
                    : doc.category === "Legal"
                    ? "bg-purple-100 text-purple-800"
                    : doc.category === "Benefits"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {doc.category}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-2">{doc.name}</h3>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span>
                  {doc.type} • {doc.size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Uploaded: {doc.date}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Uploading State */}
      {uploading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p>Uploading document...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory === "All"
              ? "You haven't uploaded any documents yet."
              : `No documents in ${selectedCategory} category.`}
          </p>
          <label className="cursor-pointer inline-block">
            <div className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Your First Document
            </div>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
