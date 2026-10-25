import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { MAX_PRESET_NAME_LENGTH } from '../hooks/useUserPresets';

interface SavePresetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    hasPresetWithName: (name: string) => boolean;
}

export function SavePresetDialog({
    isOpen,
    onClose,
    onSave,
    hasPresetWithName,
}: SavePresetDialogProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Name is required');
            return;
        }

        if (hasPresetWithName(trimmedName)) {
            setError('A preset with this name already exists');
            return;
        }

        onSave(trimmedName);
        setName('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setName('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Save Preset</DialogTitle>
                    <DialogDescription>
                        Save your current layer configuration as a preset.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Preset name"
                        maxLength={MAX_PRESET_NAME_LENGTH}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                    {error && (
                        <p className="text-sm text-destructive mt-2">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Preset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
