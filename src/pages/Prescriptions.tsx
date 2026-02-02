import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Trash2, Upload, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { prescriptionService } from '@/services/prescription.service';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const Prescriptions: React.FC = () => {
  const navigate = useNavigate();
  const { prescriptions, addPrescription, removePrescription, loadPrescriptions } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await prescriptionService.fileToBase64(file);
      const prescription = await prescriptionService.uploadPrescription(base64, file.name);
      addPrescription(prescription);
      toast.success('Prescription uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload prescription');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removePrescription(id);
      toast.success('Prescription deleted');
    } catch (error) {
      toast.error('Failed to delete prescription');
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-24">
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Saved Prescriptions</h1>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleUpload}
          className="hidden"
        />

        <div className="px-4 py-4">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">No prescriptions saved</h2>
              <p className="text-muted-foreground mb-6">Upload your prescriptions for quick ordering</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} className="mr-2" />
                Upload Prescription
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx, index) => (
                <motion.div
                  key={rx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="swift-card"
                >
                  <div className="flex gap-3">
                    <img src={rx.imageUrl} alt="Prescription" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rx.name || 'Prescription'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(rx.uploadDate), 'MMM d, yyyy')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${rx.verified ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                        {rx.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => handleDelete(rx.id)} className="p-2 hover:bg-destructive-light rounded-lg text-destructive">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Button onClick={() => fileInputRef.current?.click()} size="xl" className="w-full">
            <Plus size={18} className="mr-2" />
            Upload New Prescription
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Prescriptions;
