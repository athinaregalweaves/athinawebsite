import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "@/lib/api";
import { clearAdminSession } from "@/lib/authStorage";
import AdminLayout from "@/components/admin/AdminLayout";
import { getContactInquiries, updateInquiryStatus, deleteInquiry, ContactInquiry } from "@/lib/contactStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  new: "bg-green-100 text-green-800 border-green-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-muted text-muted-foreground border-border",
};

const AdminInquiries = () => {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken()
      .then(() => setLoading(false))
      .catch(() => { clearAdminSession(); navigate("/admin/login"); });
  }, [navigate]);

  useEffect(() => {
    if (!loading) setInquiries(getContactInquiries());
  }, [loading]);

  const handleStatusChange = (id: string, status: ContactInquiry["status"]) => {
    updateInquiryStatus(id, status);
    setInquiries(getContactInquiries());
  };

  const handleDelete = (id: string) => {
    deleteInquiry(id);
    setInquiries(getContactInquiries());
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="font-body text-xl text-foreground/50">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  const newCount = inquiries.filter(i => i.status === "new").length;

  return (
    <AdminLayout>
      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Contact Inquiries</h1>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1">
              {inquiries.length} total{newCount > 0 && ` · ${newCount} new`}
            </p>
          </div>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-20 border border-border bg-background">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-body text-lg text-muted-foreground">No inquiries yet</p>
            <p className="font-body text-sm text-muted-foreground/60 mt-1">
              Contact form submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-background border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-lg font-semibold text-foreground">{inquiry.name}</h3>
                      <Badge variant="outline" className={`text-xs ${statusColors[inquiry.status]}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-sm font-body text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Mail size={14} className="text-primary" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-foreground transition-colors">{inquiry.email}</a>
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone size={14} className="text-primary" />
                        <a href={`tel:${inquiry.phone}`} className="hover:text-foreground transition-colors">{inquiry.phone}</a>
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-accent" />
                        {inquiry.preferredDate ? new Date(inquiry.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
                      </span>
                    </div>

                    {inquiry.message && (
                      <p className="font-body text-sm text-foreground/70 bg-muted/30 p-3 border-l-2 border-accent">
                        {inquiry.message}
                      </p>
                    )}

                    <p className="font-body text-xs text-muted-foreground/50">
                      Submitted {new Date(inquiry.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Select value={inquiry.status} onValueChange={(v) => handleStatusChange(inquiry.id, v as ContactInquiry["status"])}>
                      <SelectTrigger className="w-[130px] font-body text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this inquiry from {inquiry.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(inquiry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInquiries;
