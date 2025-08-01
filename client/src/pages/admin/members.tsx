import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, UserPlus, Search, Download, Filter } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<{success: number, errors: string[]} | null>(null);

  const { data: members, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/members"],
  });

  const importMembersMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/members/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setImportResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      setSelectedFile(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
      setImportResults(null);
    } else {
      alert('Please select a valid Excel file (.xlsx)');
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMembersMutation.mutate(selectedFile);
    }
  };

  const filteredMembers = members?.filter(member => 
    member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getMemberStatusBadge = (status: string) => {
    const colors = {
      Gold: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      Silver: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      Bronze: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    };
    return colors[status as keyof typeof colors] || "bg-blue-500/10 text-blue-600 border-blue-500/20";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-2">Manage club members and import member data</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Members from Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file (.xlsx) with member information. The file should include columns for:
                  First Name, Last Name, Email, Phone, Member Number, Membership Type, etc.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Click to select Excel file
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Only .xlsx files are supported</p>
                </div>
                
                {selectedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-green-600">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                
                {importResults && (
                  <div className={`border rounded-lg p-3 ${
                    importResults.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className="font-medium text-sm">Import Results:</p>
                    <p className="text-sm">✓ {importResults.success} members imported successfully</p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-yellow-800">Errors:</p>
                        {importResults.errors.slice(0, 3).map((error, idx) => (
                          <p key={idx} className="text-xs text-yellow-700">• {error}</p>
                        ))}
                        {importResults.errors.length > 3 && (
                          <p className="text-xs text-yellow-700">... and {importResults.errors.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || importMembersMutation.isPending}
                    className="flex-1"
                  >
                    {importMembersMutation.isPending ? "Importing..." : "Import Members"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportDialogOpen(false);
                      setSelectedFile(null);
                      setImportResults(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{members?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Search Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or member number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({filteredMembers.length})</CardTitle>
          <CardDescription>
            All club members and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Handicap</TableHead>
                <TableHead>Rounds</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.memberNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-gray-500">{member.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{member.email || "—"}</TableCell>
                  <TableCell>{member.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge className={getMemberStatusBadge(member.memberStatus)}>
                      {member.memberStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.membershipType}</TableCell>
                  <TableCell>{member.handicap}</TableCell>
                  <TableCell>{member.roundsPlayed}</TableCell>
                  <TableCell>${member.accountBalance}</TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No members found matching your search." : "No members found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}