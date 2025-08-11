"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, TIMERS_CYCLE, type TimeMark } from '@/components/game-state';
import SettingsDialog from '@/components/settings-dialog';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Settings, Lock, Unlock, X, ChevronsUpDown, Swords, Camera, Pause, Play } from 'lucide-react';
import { getDictionary, type Dictionary } from '@/lib/dictionary';
import { bossData, damageTypes, type Boss, type DamageType } from "@/lib/boss-data";
import { detectGameState } from '@/ai/flows/detect-game-state';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getResistanceClass = (value: string) => {
    if (value.includes('%')) {
        const num = parseFloat(value.replace('%', ''));
        if (isNaN(num)) return 'text-primary';

        if (num > 0) return 'text-red-400';
        if (num < 0) return 'text-green-400';

    } else {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
            if (num <= 154) return 'text-green-400';
            if (num >= 541) return 'text-red-400';
            if (num > 154 && num < 541) return 'text-yellow-400';
        }
    }
    return 'text-primary';
};


const captureScreen = async (): Promise<string> => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: "screen" } as any });
        const track = stream.getVideoTracks()[0];
        
        // Use a video element to capture a frame
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        return new Promise((resolve, reject) => {
            video.addEventListener('canplay', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Stop the stream
                track.stop();
                
                resolve(canvas.toDataURL('image/jpeg'));
            }, { once: true });

            setTimeout(() => reject(new Error('Screenshot timeout')), 5000);
        });
    } catch (err) {
        console.error("Error capturing screen:", err);
        throw err;
    }
};

function BossWeaknessPanel({ 
    dict, 
    selectedBoss, 
    setSelectedBoss,
    isLocked,
    isExpanded,
    setIsExpanded,
    language,
}: { 
    dict: Dictionary, 
    selectedBoss: Boss | null, 
    setSelectedBoss: (boss: Boss | null) => void,
    isLocked: boolean,
    isExpanded: boolean,
    setIsExpanded: (expanded: boolean) => void;
    language: 'ru' | 'en';
}) {
    const bossDict = dict.bosses;
    
    const handleBossSelect = (bossName: string) => {
        const boss = bossData.find(b => b.name === bossName) || null;
        setSelectedBoss(boss);
    };
    
    const getBestDamageType = (boss: Boss | null): { type: DamageType, value: string } | null => {
        if (!boss) return null;
        let bestType: DamageType | null = null;
        let bestValue = -Infinity;

        Object.entries(boss.resistances).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('%')) {
                const numericValue = parseFloat(value.replace('%', ''));
                if (!isNaN(numericValue) && numericValue > bestValue) {
                    bestValue = numericValue;
                    bestType = key as DamageType;
                }
            }
        });
        
        return bestType ? { type: bestType, value: boss.resistances[bestType] } : null;
    };
    
    const getWorstDamageType = (boss: Boss | null): { type: DamageType, value: string } | null => {
        if (!boss) return null;
        let worstType: DamageType | null = null;
        let worstValue = Infinity;

        Object.entries(boss.resistances).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('%')) {
                const numericValue = parseFloat(value.replace('%', ''));
                if (!isNaN(numericValue)) {
                    if (numericValue < worstValue) {
                        worstValue = numericValue;
                        worstType = key as DamageType;
                    }
                }
            }
        });
        
        return worstType ? { type: worstType, value: boss.resistances[worstType] } : null;
    };

    const getBestStatusEffect = (boss: Boss | null): { type: DamageType, value: string } | null => {
        if (!boss) return null;

        if (boss.name.startsWith("Libra")) {
            return { type: 'madness', value: boss.resistances.madness };
        }
        if (boss.name.startsWith("Adel")) {
            return { type: 'poison', value: boss.resistances.poison };
        }
        
        let bestType: DamageType | null = null;
        let bestValue = Infinity;
        
        const statusEffects: DamageType[] = ['bleed', 'frostbite', 'poison', 'scarletRot', 'sleep', 'madness'];
        
        for (const key of statusEffects) {
            const damageType = key as DamageType;
            const value = boss.resistances[damageType];
            if (value && !value.includes('%') && value !== '-') {
                const num = parseInt(value, 10);
                if (!isNaN(num)) {
                    if (num < bestValue) {
                        bestValue = num;
                        bestType = damageType;
                    }
                }
            }
        }
        return bestType ? { type: bestType, value: boss.resistances[bestType] } : null;
    }
    
    const damageTypeKeys = Object.keys(damageTypes) as DamageType[];
    const row1Keys = damageTypeKeys.slice(0, 5);
    const row2Keys = damageTypeKeys.slice(5, 10);
    const row3Keys = damageTypeKeys.slice(10);


    const bestDamage = getBestDamageType(selectedBoss);
    const BestDamageIcon = bestDamage ? damageTypes[bestDamage.type].Icon : null;
    
    const worstDamage = getWorstDamageType(selectedBoss);
    const WorstDamageIcon = worstDamage ? damageTypes[worstDamage.type].Icon : null;

    const bestStatus = getBestStatusEffect(selectedBoss);
    const BestStatusIcon = bestStatus ? damageTypes[bestStatus.type].Icon : null;
    
    const getBossDisplayName = (boss: Boss) => {
        return language === 'ru' ? boss.name_ru : boss.name;
    }

    return (
        <Card className="w-[480px] shadow-2xl border-primary/20 flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           {selectedBoss?.Icon && <selectedBoss.Icon className="h-6 w-6" />}
                           {selectedBoss ? getBossDisplayName(selectedBoss) : bossDict.title}
                        </CardTitle>
                        <CardDescription>{bossDict.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <Select onValueChange={handleBossSelect} value={selectedBoss?.name ?? ""} disabled={isLocked}>
                    <SelectTrigger>
                         <SelectValue placeholder={bossDict.selectBoss} />
                    </SelectTrigger>
                    <SelectContent>
                        {bossData.map(boss => {
                            return (
                                <SelectItem key={boss.name} value={boss.name}>
                                    <div className="flex items-center gap-2">
                                        {boss.Icon && <boss.Icon className="h-5 w-5" />}
                                        <span>{getBossDisplayName(boss)}</span>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

                {selectedBoss && (
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                             <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card-foreground/10 text-card-foreground p-3 min-h-[100px]">
                                <h3 className="text-sm font-semibold">{bossDict.best}</h3>
                                {bestDamage && BestDamageIcon && (
                                    <div className="flex flex-col items-center gap-1">
                                       <div className="flex items-center justify-center gap-2 text-base font-medium text-green-400">
                                         <BestDamageIcon className="h-5 w-5" />
                                         <span>{bossDict[damageTypes[bestDamage.type].labelKey]}</span>
                                       </div>
                                       <span className="text-sm font-mono">{bestDamage.value}</span>
                                    </div>
                                )}
                            </div>
                             <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card-foreground/10 text-card-foreground p-3 min-h-[100px]">
                                <h3 className="text-sm font-semibold">{bossDict.worst}</h3>
                                {worstDamage && WorstDamageIcon && (
                                     <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center justify-center gap-2 text-base font-medium text-red-400">
                                          <WorstDamageIcon className="h-5 w-5" />
                                          <span>{bossDict[damageTypes[worstDamage.type].labelKey]}</span>
                                        </div>
                                        <span className="text-sm font-mono">{worstDamage.value}</span>
                                     </div>
                                )}
                            </div>
                        </div>

                         <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card-foreground/10 text-card-foreground p-3 min-h-[100px]">
                                <h3 className="text-sm font-semibold">{bossDict.bestStatus}</h3>
                                {bestStatus && BestStatusIcon && (
                                     <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center justify-center gap-2 text-base font-medium text-green-400">
                                          <BestStatusIcon className="h-5 w-5" />
                                          <span>{bossDict[damageTypes[bestStatus.type].labelKey]}</span>
                                        </div>
                                        <span className="text-sm font-mono">{bestStatus.value}</span>
                                     </div>
                                )}
                            </div>


                        {isExpanded && (
                            <div className="w-full">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            {row1Keys.map(key => {
                                                const dt = damageTypes[key as DamageType];
                                                return (
                                                    <TableCell key={key} className="text-center p-1">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <dt.Icon className="h-5 w-5" />
                                                            <span className="text-xs">{bossDict[dt.labelKey]}</span>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                        <TableRow>
                                            {row1Keys.map(key => {
                                                const value = selectedBoss.resistances[key as DamageType];
                                                return (
                                                    <TableCell key={key} className={cn("text-center font-mono p-1 text-xs", getResistanceClass(value))}>
                                                        {value}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                        <TableRow>
                                             {row2Keys.map(key => {
                                                const dt = damageTypes[key as DamageType];
                                                return (
                                                    <TableCell key={key} className="text-center p-1">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <dt.Icon className="h-5 w-5" />
                                                            <span className="text-xs">{bossDict[dt.labelKey]}</span>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                        <TableRow>
                                            {row2Keys.map(key => {
                                                const value = selectedBoss.resistances[key as DamageType];
                                                return (
                                                    <TableCell key={key} className={cn("text-center font-mono p-1 text-xs", getResistanceClass(value))}>
                                                        {value}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                        <TableRow>
                                             {row3Keys.map(key => {
                                                const dt = damageTypes[key as DamageType];
                                                return (
                                                    <TableCell key={key} className="text-center p-1">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <dt.Icon className="h-5 w-5" />
                                                            <span className="text-xs">{bossDict[dt.labelKey]}</span>
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                        <TableRow>
                                            {row3Keys.map(key => {
                                                const value = selectedBoss.resistances[key as DamageType];
                                                return (
                                                    <TableCell key={key} className={cn("text-center font-mono p-1 text-xs", getResistanceClass(value))}>
                                                        {value}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={() => setIsExpanded(!isExpanded)} variant="secondary" className="w-full" disabled={!selectedBoss || isLocked}>
                    <ChevronsUpDown className="h-4 w-4 mr-2" />
                    {isExpanded ? bossDict.collapse : bossDict.expand}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function NightReignTimer() {
  const [isClient, setIsClient] = useState(false);
  const { settings, setSetting, resetSettings, isLoaded } = useSettings();
  const dict = getDictionary(settings.language);

  const [gameState, setGameState] = useState<GameState>('WAITING');
  const [remainingTime, setRemainingTime] = useState(TIMERS_CYCLE[0]);
  const [totalTime, setTotalTime] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [timeMarks, setTimeMarks] = useState<TimeMark[]>(() => dict.timeMarks);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTotalTimerActive, setIsTotalTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBossWeaknessOpen, setIsBossWeaknessOpen] = useState(false);
  const [isBossPanelExpanded, setIsBossPanelExpanded] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const { toast } = useToast();
  
  const totalTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mainTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoDetectIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
      setTimeMarks(dict.timeMarks);
  }, [dict.timeMarks, settings.language]);
  
  const togglePause = () => {
    if (!isTotalTimerActive) return;
    setIsPaused(prev => !prev);
  }

  const stopTimers = () => {
    if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    if (mainTimerIntervalRef.current) clearInterval(mainTimerIntervalRef.current);
    totalTimerIntervalRef.current = null;
    mainTimerIntervalRef.current = null;
    setIsTimerActive(false);
    setIsTotalTimerActive(false);
    setIsPaused(false);
  };
  
  const stopAutoDetection = useCallback(() => {
    if (autoDetectIntervalRef.current) {
        clearInterval(autoDetectIntervalRef.current);
        autoDetectIntervalRef.current = null;
    }
    setIsAutoDetecting(false);
    setIsLoading(false);
  }, []);

  const fullReset = useCallback(() => {
    stopTimers();
    stopAutoDetection();
    setGameState('WAITING');
    setRemainingTime(TIMERS_CYCLE[0]);
    setTotalTime(0);
    setCurrentDayIndex(0);
    setTimeMarks(dict.timeMarks.map(mark => ({ ...mark, time: '-' })));
    setSelectedBoss(null);
    setIsBossPanelExpanded(false);
    toast({ title: dict.toasts.timersReset.title, description: dict.toasts.timersReset.description });
    // Restart auto-detection after reset
    startAutoDetection();
  }, [toast, dict, stopAutoDetection]);

  const recordTimeMark = useCallback(() => {
    setTimeMarks(prev => {
        const newMarks = [...prev];
        if (newMarks[currentDayIndex]) {
            newMarks[currentDayIndex].time = formatTime(totalTime);
        }
        return newMarks;
    });
  }, [currentDayIndex, totalTime]);

  const processGameState = useCallback((newState: GameState) => {
    if (newState === 'UNKNOWN' || newState === gameState) return;
    
    setGameState(newState);
    
    switch (newState) {
      case 'DAY_I':
        if (!isTotalTimerActive) {
          // No need for fullReset() here as it's handled differently now
          stopAutoDetection();
          setIsTotalTimerActive(true);
          setIsTimerActive(true);
          setCurrentDayIndex(0);
          setRemainingTime(TIMERS_CYCLE[0]);
        }
        break;
      case 'DAY_II':
        if (currentDayIndex === 0) {
            recordTimeMark();
            setIsTimerActive(true);
            setCurrentDayIndex(1);
            setRemainingTime(TIMERS_CYCLE[1]);
        }
        break;
      case 'DAY_III':
        if (currentDayIndex === 1) {
            recordTimeMark();
            setIsTimerActive(true);
            setCurrentDayIndex(2);
            setRemainingTime(TIMERS_CYCLE[2]);
        }
        break;
      case 'DEFEAT':
      case 'NIGHT_LORD_DEFEATED':
        recordTimeMark();
        stopTimers();
        stopAutoDetection();
        setSelectedBoss(null);
        setIsBossPanelExpanded(false);
        break;
    }
  }, [gameState, isTotalTimerActive, currentDayIndex, recordTimeMark, stopAutoDetection]);
  
  const checkGameState = useCallback(async () => {
    setIsLoading(true);
    try {
      const screenImage = await captureScreen();
      const result = await detectGameState({ screenImage });
      processGameState(result.gameState);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("Access to the feature")) {
          toast({
              variant: "destructive",
              title: "Permissions Error",
              description: "Screen capture permission was denied.",
          });
      } else {
         toast({
            variant: "destructive",
            title: dict.toasts.detectionError.title,
            description: dict.toasts.detectionError.description,
         });
      }
      stopAutoDetection();
    } finally {
      setIsLoading(false);
    }
  }, [processGameState, toast, dict, stopAutoDetection]);

  const startAutoDetection = useCallback(() => {
    if (isAutoDetecting || isTotalTimerActive) return;
    setIsAutoDetecting(true);
    // The interval will be set in the useEffect below
  }, [isAutoDetecting, isTotalTimerActive]);

  useEffect(() => {
    if (isClient && !isTotalTimerActive && !isAutoDetecting) {
        startAutoDetection();
    }
  }, [isClient, isTotalTimerActive, isAutoDetecting, startAutoDetection]);


  useEffect(() => {
      if (isAutoDetecting && !autoDetectIntervalRef.current) {
          checkGameState(); // Check immediately
          autoDetectIntervalRef.current = setInterval(checkGameState, 5000); // And every 5 seconds
      } else if (!isAutoDetecting && autoDetectIntervalRef.current) {
          clearInterval(autoDetectIntervalRef.current);
          autoDetectIntervalRef.current = null;
      }

      return () => {
          if (autoDetectIntervalRef.current) {
              clearInterval(autoDetectIntervalRef.current);
          }
      };
  }, [isAutoDetecting, checkGameState]);


  const startTimersManually = useCallback(() => {
    if (isTotalTimerActive) return;
    stopAutoDetection();
    processGameState('DAY_I');
    toast({ title: dict.toasts.timersStarted.title, description: dict.toasts.timersStarted.description });
  }, [isTotalTimerActive, processGameState, toast, dict, stopAutoDetection]);


  useEffect(() => {
    if (isTotalTimerActive && !isPaused) {
      totalTimerIntervalRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else {
      if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    }
    return () => {
      if (totalTimerIntervalRef.current) clearInterval(totalTimerIntervalRef.current);
    };
  }, [isTotalTimerActive, isPaused]);

  useEffect(() => {
    if (isTimerActive && !isPaused) {
      mainTimerIntervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            if (mainTimerIntervalRef.current) clearInterval(mainTimerIntervalRef.current);
            setIsTimerActive(false);
            if (currentDayIndex < TIMERS_CYCLE.length - 1) {
              // Waiting for next day trigger
            } else {
              stopTimers();
              setGameState('WAITING');
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
        if (mainTimerIntervalRef.current) clearInterval(mainTimerIntervalRef.current);
    }
    return () => {
      if (mainTimerIntervalRef.current) clearInterval(mainTimerIntervalRef.current);
    };
  }, [isTimerActive, currentDayIndex, isPaused]);
  
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (autoDetectIntervalRef.current) clearInterval(autoDetectIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.altKey) {
            e.preventDefault();
            if (e.key === '1') fullReset();
            if (e.key === '2' && !isTotalTimerActive && isAutoDetecting) stopAutoDetection();
            if (e.key === '3') togglePause();
            if (e.key === '4') startTimersManually();
            if (e.key === 'l') setIsLocked(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullReset, startTimersManually, stopAutoDetection, isTotalTimerActive, togglePause, isAutoDetecting]);


  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isLocked) return;
    const target = e.target as HTMLElement;
    // Allow dragging only on the header/drag handle area
    if (target.closest('[data-drag-handle]')) {
        setIsDragging(true);
        const containerRect = containerRef.current.getBoundingClientRect();
        dragStartPos.current = {
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        };
    }
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current || isLocked) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    setPosition({ x: newX, y: newY });
  };
  
  const onDragEnd = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', onDragEnd);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    };
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [isDragging]);


  if (!isClient || !isLoaded) {
    return null;
  }
  
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${settings.scale})`,
          opacity: settings.opacity,
          touchAction: 'none',
        }}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1">
            <div className={cn("transition-all duration-300 ease-in-out", isBossWeaknessOpen ? "w-[480px] opacity-100" : "w-0 opacity-0 overflow-hidden")}>
                <BossWeaknessPanel 
                    dict={dict} 
                    selectedBoss={selectedBoss} 
                    setSelectedBoss={setSelectedBoss}
                    isLocked={isLocked}
                    isExpanded={isBossPanelExpanded}
                    setIsExpanded={setIsBossPanelExpanded}
                    language={settings.language}
                />
            </div>
            
            <div className="flex flex-col items-center justify-center">
                <Button variant="ghost" size="icon" onClick={() => setIsBossWeaknessOpen(prev => !prev)} disabled={isLocked || isLoading} className="h-10 w-10">
                    <Swords className="h-5 w-5" />
                </Button>
            </div>
            
            <Card className="w-[380px] shadow-2xl border-primary/20">
              <div
                  data-drag-handle
                  className={cn("h-8 bg-card-foreground/10", isLocked ? "cursor-default" : "cursor-move")}
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-primary whitespace-nowrap">
                           <span style={{whiteSpace: 'nowrap'}}>ER Nightreign</span>
                           <br />
                           Timer
                        </CardTitle>
                        <CardDescription>{dict.status}: {isLoading ? 'Detecting...' : gameState} {isPaused ? `(${dict.paused})` : ''}</CardDescription>
                    </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} disabled={isLocked || isLoading}>
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={togglePause} disabled={isLocked || isLoading || !isTotalTimerActive}>
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => setIsLocked(prev => !prev)} disabled={isLoading}>
                        {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                     </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLocked || isLoading}>
                          <X className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{dict.confirmations.close.title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {dict.confirmations.close.description}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{dict.confirmations.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => setIsVisible(false)} className={cn(buttonVariants({ variant: "secondary" }))}>{dict.confirmations.confirm}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">{dict.timeToShrink}</p>
                    <p className={cn("text-4xl font-bold font-mono tracking-tighter", isTimerActive && remainingTime > 0 && "animate-pulse-red text-destructive", isPaused && "opacity-50")}>
                      {formatTime(remainingTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{dict.totalTime}</p>
                    <p className={cn("text-4xl font-bold font-mono tracking-tighter text-primary", isPaused && "opacity-50")}>
                      {formatTime(totalTime)}
                    </p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dict.event}</TableHead>
                      <TableHead className="text-right">{dict.time}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeMarks.map((mark, index) => (
                      <TableRow key={mark.day} className={cn(index === currentDayIndex && isTimerActive && "bg-primary/10")}>
                        <TableCell className="font-medium">{mark.day}</TableCell>
                        <TableCell className="text-right font-mono">{mark.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                   <Button onClick={startTimersManually} className="flex-1" variant="secondary" disabled={isLoading || isTotalTimerActive || isLocked || isAutoDetecting}>
                    {isLoading && isAutoDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.manualStart}
                  </Button>
                  <Button onClick={stopAutoDetection} className="flex-1" variant={"destructive"} disabled={isLocked || isLoading || isTotalTimerActive || !isAutoDetecting}>
                    {isLoading && isAutoDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                    {dict.settings.autoDetectionStop}
                  </Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="flex-1" disabled={isLoading || isLocked}>
                          {dict.reset}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{dict.confirmations.reset.title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {dict.confirmations.reset.description}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{dict.confirmations.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={fullReset} className={cn(buttonVariants({ variant: "secondary" }))}>{dict.confirmations.confirm}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardFooter>
            </Card>
        </div>
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSetting={setSetting}
        resetSettings={resetSettings}
        dict={dict}
      />
    </>
  );
}
