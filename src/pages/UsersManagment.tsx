import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchUserProfile, fetchWorkOrders } from '@/lib/api';
import { UserProfile, WorkOrder } from '@/types';
import { FileText, MapPin, Package, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

