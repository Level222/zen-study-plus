import type { FC, ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  yes: string;
  no: string;
  onClose: (isConfirmed: boolean) => void;
  children?: ReactNode;
};

const ConfirmationDialog: FC<ConfirmDialogProps> = ({ open, title, yes, no, onClose, children }) => {
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>{title}</DialogTitle>
      {children && (
        <DialogContent>
          <DialogContentText>{children}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={() => onClose(false)}>{no}</Button>
        <Button onClick={() => onClose(true)}>{yes}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
