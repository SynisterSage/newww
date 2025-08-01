import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Search, Edit, Save, X, Users, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { User } from "@shared/schema";

interface AdminConditionsProps {
  userData?: User;
}

export default function AdminConditions({ userData }: AdminConditionsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkHandicap, setBulkHandicap] = useState("");

  const { data: members = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/members'],
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: Partial<User> }) => {
      const response = await apiRequest('PATCH', `/api/admin/members/${memberId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      setEditingMember(null);
      toast({
        title: "Member Updated",
        description: "Member conditions have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update member conditions.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { memberIds: string[]; status?: string; handicap?: string }) => {
      const response = await apiRequest('PATCH', '/api/admin/members/bulk', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/members'] });
      setSelectedMembers(new Set());
      setBulkUpdateMode(false);
      setBulkStatus("");
      setBulkHandicap("");
      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedMembers.size} members successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Bulk Update Failed",
        description: "Failed to update selected members.",
        variant: "destructive",
      });
    },
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || member.memberStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getMemberStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Payment Plan': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Partial Payment': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="w-4 h-4" />;
      case 'Payment Plan': return <Clock className="w-4 h-4" />;
      case 'Partial Payment': return <AlertCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleMemberSelect = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleBulkUpdate = () => {
    if (selectedMembers.size === 0) return;
    
    const updates: any = { memberIds: Array.from(selectedMembers) };
    if (bulkStatus) updates.status = bulkStatus;
    if (bulkHandicap && !isNaN(Number(bulkHandicap))) updates.handicap = Number(bulkHandicap);
    
    bulkUpdateMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0]">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gray-300 rounded-xl"></div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#08452e] mb-2">Member Conditions</h1>
            <p className="text-muted-foreground">Manage member status, handicaps, and conditions</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={bulkUpdateMode ? "default" : "outline"}
              onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
              className={bulkUpdateMode ? "bg-[#1B4332] text-white" : ""}
            >
              <Edit className="w-4 h-4 mr-2" />
              {bulkUpdateMode ? "Exit Bulk Mode" : "Bulk Edit"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {members.filter(m => m.memberStatus === 'Paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Paid Members</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {members.filter(m => m.memberStatus === 'Payment Plan').length}
              </div>
              <div className="text-sm text-muted-foreground">Payment Plans</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {members.filter(m => m.memberStatus === 'Partial Payment').length}
              </div>
              <div className="text-sm text-muted-foreground">Partial Payments</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {Math.round(members.reduce((sum, m) => sum + (m.handicap || 0), 0) / members.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Handicap</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Update Panel */}
        {bulkUpdateMode && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedMembers.size} members selected
                  </span>
                </div>
                <div className="flex gap-2 flex-1">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Change</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                      <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="New Handicap"
                    value={bulkHandicap}
                    onChange={(e) => setBulkHandicap(e.target.value)}
                    className="w-32"
                    type="number"
                    min="0"
                    max="54"
                  />
                  <Button
                    onClick={handleBulkUpdate}
                    disabled={selectedMembers.size === 0 || bulkUpdateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, member number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                  <SelectItem value="Partial Payment">Partial Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Members ({filteredMembers.length})</span>
              {bulkUpdateMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedMembers.size === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {bulkUpdateMode && <TableHead className="w-12">Select</TableHead>}
                    <TableHead className="py-4 px-4 font-semibold text-gray-900">Member #</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900">Email</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900">Membership</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900 text-center">Handicap</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900 text-center">Rounds</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900 text-right">Balance</TableHead>
                    <TableHead className="py-4 px-4 font-semibold text-gray-900 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      {bulkUpdateMode && (
                        <TableCell className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedMembers.has(member.id)}
                            onChange={() => handleMemberSelect(member.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      <TableCell className="py-4 px-4 font-medium text-blue-600">{member.memberNumber}</TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-gray-500">{member.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-gray-700">{member.email || "—"}</TableCell>
                      <TableCell className="py-4 px-4">
                        <Badge 
                          variant="outline" 
                          className={`${getMemberStatusBadge(member.memberStatus)} px-2 py-1 text-xs font-medium flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(member.memberStatus)}
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
                      <TableCell className="py-4 px-4 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Member Conditions</DialogTitle>
                            </DialogHeader>
                            <EditMemberForm 
                              member={editingMember} 
                              onSave={(updates) => updateMemberMutation.mutate({ memberId: member.id, updates })}
                              onCancel={() => setEditingMember(null)}
                              isLoading={updateMemberMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={bulkUpdateMode ? 10 : 9} className="text-center py-12 text-gray-500">
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

interface EditMemberFormProps {
  member: User | null;
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditMemberForm({ member, onSave, onCancel, isLoading }: EditMemberFormProps) {
  const [status, setStatus] = useState(member?.memberStatus || "");
  const [handicap, setHandicap] = useState(member?.handicap?.toString() || "");
  const [accountBalance, setAccountBalance] = useState(member?.accountBalance || "");

  if (!member) return null;

  const handleSave = () => {
    const updates: Partial<User> = {};
    if (status !== member.memberStatus) updates.memberStatus = status;
    if (handicap !== member.handicap?.toString()) updates.handicap = handicap ? Number(handicap) : null;
    if (accountBalance !== member.accountBalance) updates.accountBalance = accountBalance;
    
    onSave(updates);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Member Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Payment Plan">Payment Plan</SelectItem>
            <SelectItem value="Partial Payment">Partial Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Handicap</label>
        <Input
          type="number"
          min="0"
          max="54"
          value={handicap}
          onChange={(e) => setHandicap(e.target.value)}
          placeholder="Enter handicap"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Account Balance</label>
        <Input
          type="number"
          step="0.01"
          value={accountBalance}
          onChange={(e) => setAccountBalance(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}