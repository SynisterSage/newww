import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, CreditCard, Trophy, Calendar, CheckCircle, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Member {
  id: string;
  username: string;
  memberNumber: string;
  memberStatus: string;
  handicap: number;
  roundsPlayed: number;
  accountBalance: string;
  email?: string;
  joinDate?: string;
  lastActivity?: string;
  isActive?: boolean;
}

export default function AdminMembersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["/api", "admin", "members"],
    enabled: true,
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      const response = await apiRequest("PATCH", `/api/admin/members/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "admin", "members"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      "Gold": { color: "bg-yellow-100 text-yellow-800" },
      "Silver": { color: "bg-gray-100 text-gray-800" },
      "Bronze": { color: "bg-orange-100 text-orange-800" },
      "Platinum": { color: "bg-purple-100 text-purple-800" },
      "Active": { color: "bg-green-100 text-green-800" },
      "Inactive": { color: "bg-red-100 text-red-800" },
    };
    
    const variant = variants[status as keyof typeof variants] || { color: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge className={variant.color}>
        {status}
      </Badge>
    );
  };

  const getHandicapColor = (handicap: number) => {
    if (handicap <= 10) return "text-green-600";
    if (handicap <= 18) return "text-blue-600";
    if (handicap <= 25) return "text-orange-600";
    return "text-red-600";
  };

  const filteredMembers = members.filter((member: Member) => {
    const matchesStatus = statusFilter === "all" || member.memberStatus === statusFilter;
    const matchesSearch = 
      member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-golf-green">Member Management</h1>
        <div className="text-sm text-gray-600">
          Total Members: {members.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, member number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Platinum">Platinum</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4">
        {filteredMembers.map((member: Member) => (
          <Card key={member.id} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-golf-green" />
                      <span className="font-medium text-lg">{member.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">#{member.memberNumber}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3" />
                      <span>Balance: ${member.accountBalance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3 h-3" />
                      <span className={getHandicapColor(member.handicap)}>
                        Handicap: {member.handicap}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Rounds: {member.roundsPlayed}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(member.memberStatus)}
                    {member.isActive !== false ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Member Actions */}
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={member.memberStatus}
                    onValueChange={(newStatus) => 
                      updateMemberMutation.mutate({ 
                        id: member.id, 
                        updates: { memberStatus: newStatus }
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {member.isActive !== false ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMemberMutation.mutate({ 
                        id: member.id, 
                        updates: { isActive: false }
                      })}
                      disabled={updateMemberMutation.isPending}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMemberMutation.mutate({ 
                        id: member.id, 
                        updates: { isActive: true }
                      })}
                      disabled={updateMemberMutation.isPending}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "No members available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}