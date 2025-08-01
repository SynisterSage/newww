import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Search, Download, Filter } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: members, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/members"],
  });

  const syncMembersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/members/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
    },
  });

  const filteredMembers = members?.filter(member => 
    member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getMemberStatusBadge = (status: string | null) => {
    const colors = {
      Paid: "bg-green-500/10 text-green-700 border-green-500/20",
      "Payment Plan": "bg-orange-500/10 text-orange-700 border-orange-500/20",
      "Partial Payment": "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      Pending: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      Overdue: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[status as keyof typeof colors] || "bg-blue-500/10 text-blue-700 border-blue-500/20";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="lg:col-span-3 h-32 bg-gray-200 rounded-lg"></div>
          </div>
          
          {/* Table skeleton */}
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-800">Member Management</h1>
            <p className="text-muted-foreground">Manage club members and their information</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => syncMembersMutation.mutate()}
              disabled={syncMembersMutation.isPending}
            >
              <Filter className="w-4 h-4 mr-2" />
              {syncMembersMutation.isPending ? "Syncing..." : "Sync Data"}
            </Button>
            
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

      {/* Search and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-[18px] mb-[18px]">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Total Members</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-blue-600">{members?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Active club members</div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Search Members</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or member number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Members ({filteredMembers.length})</CardTitle>
              <CardDescription className="mt-1">
                All club members and their information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="py-4 px-4 font-semibold">Member #</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Name</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Email</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Phone</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Status</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Type</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Handicap</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Rounds</TableHead>
                  <TableHead className="py-4 px-4 font-semibold">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 px-4 font-medium text-blue-600">{member.memberNumber}</TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">{member.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">{member.email || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-gray-700">{member.phone || "—"}</TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge 
                        variant="outline" 
                        className={`${getMemberStatusBadge(member.memberStatus)} px-2 py-1 text-xs font-medium`}
                      >
                        {member.memberStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {member.membershipType}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center font-medium">{member.handicap || "—"}</TableCell>
                    <TableCell className="py-4 px-4 text-center">{member.roundsPlayed}</TableCell>
                    <TableCell className="py-4 px-4 font-medium text-right">
                      <span className={`${parseFloat(member.accountBalance || '0') > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${member.accountBalance}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                      <div className="space-y-2">
                        <div className="text-lg">
                          {searchTerm ? "No members found matching your search." : "No members found."}
                        </div>
                        {searchTerm && (
                          <div className="text-sm">
                            Try adjusting your search terms or clearing the search.
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}