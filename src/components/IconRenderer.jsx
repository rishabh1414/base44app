import React from 'react';
import {
  Zap, Search, TrendingUp, Star, Clock, Sparkles, Target, Palette, BarChart3, MessageSquare,
  CheckCircle, MapPin, Link, Type, Code, DollarSign, Facebook, Linkedin, Layout, BarChart, Mail,
  Users, Image, FileText, Twitter, Instagram, Youtube, Calendar, Clipboard, Activity, Filter,
  BarChart2, PieChart as RePieChart, List, PenTool, Award, Film, Speaker, Mic, Podcast, BookOpen, Heart,
  Smile, Share2, Globe, Rss, AtSign, Bot, Trello, Slack, Aperture, Camera, Scissors, GitBranch,
  Anchor, Navigation, Eye, Shield, Key, Lock, Server, Database, Cloud, BrainCircuit, Scale,
  Gavel, Landmark, Briefcase, Stethoscope, HeartPulse, Dumbbell, Apple as AppleIcon, Bed, Sunrise, Sunset,
  Plane, Home, Book as BookIcon, GraduationCap, Users2, Coffee, Gift, ShoppingBag, Utensils, Car, Ticket,
  Clapperboard, Music, Gamepad2, Languages, HelpCircle, Monitor, Phone, RefreshCw,
} from 'lucide-react';

const iconMap = {
  Zap, Search, TrendingUp, Star, Clock, Sparkles, Target, Palette, BarChart3, MessageSquare,
  CheckCircle, MapPin, Link, Type, Code, DollarSign, Facebook, Linkedin, Layout, BarChart, Mail,
  Users, Image, FileText, Twitter, Instagram, Youtube, Calendar, Clipboard, Activity, Filter,
  BarChart2, PieChart: RePieChart, List, PenTool, Award, Film, Speaker, Mic, Podcast, BookOpen, Heart,
  Smile, Share2, Globe, Rss, AtSign, Bot, Trello, Slack, Aperture, Camera, Scissors, GitBranch,
  Anchor, Navigation, Eye, Shield, Key, Lock, Server, Database, Cloud, BrainCircuit, Scale,
  Gavel, Landmark, Briefcase, Stethoscope, HeartPulse, Dumbbell, Apple: AppleIcon, Bed, Sunrise, Sunset,
  Plane, Home, Book: BookIcon, GraduationCap, Users2, Coffee, Gift, ShoppingBag, Utensils, Car, Ticket,
  Clapperboard, Music, Gamepad2, Languages, HelpCircle, Monitor, Phone, RefreshCw,
};

const IconRenderer = ({ iconName, ...props }) => {
  const IconComponent = iconMap[iconName] || Zap;
  return <IconComponent {...props} />;
};

export default IconRenderer;