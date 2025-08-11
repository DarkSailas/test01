"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Settings, type SetSetting, type Language } from "@/hooks/use-settings";
import { type Dictionary } from "@/lib/dictionary";
import { cn } from '@/lib/utils';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSetting: SetSetting;
  resetSettings: () => void;
  dict: Dictionary;
}

export default function SettingsDialog({ isOpen, onClose, settings, setSetting, resetSettings, dict }: SettingsDialogProps) {
  const settingsDict = dict.settings;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{settingsDict.title}</DialogTitle>
          <DialogDescription>
            {settingsDict.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="scale" className="text-right col-span-2">
              {settingsDict.scale}
            </Label>
            <Slider
              id="scale"
              value={[settings.scale]}
              onValueChange={([value]) => setSetting('scale', value)}
              max={2}
              min={0.5}
              step={0.1}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="opacity" className="text-right col-span-2">
              {settingsDict.opacity}
            </Label>
            <Slider
              id="opacity"
              value={[settings.opacity]}
              onValueChange={([value]) => setSetting('opacity', value)}
              max={1}
              min={0.1}
              step={0.05}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label className="text-right col-span-2">{settingsDict.language}</Label>
            <RadioGroup
              value={settings.language}
              onValueChange={(value) => setSetting('language', value as Language)}
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ru" id="ru" />
                <Label htmlFor="ru">Русский</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en">English</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost">{settingsDict.reset}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dict.confirmations.resetSettings.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {dict.confirmations.resetSettings.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{dict.confirmations.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={resetSettings} className={cn(buttonVariants({ variant: "secondary" }))}>{dict.confirmations.confirm}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={onClose} variant="secondary">{settingsDict.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
