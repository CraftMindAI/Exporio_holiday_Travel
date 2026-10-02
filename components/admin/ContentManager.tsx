'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, getAllInquiries, createTour, getTours, updateTour, deleteTour, createDestination, getDestinations, updateDestination, deleteDestination, deleteInquiry, createBlog, getBlogs, updateBlog, deleteBlog, notifySubscribers } from '@/lib/supabase';
import { Inquiry, TourPackage, Destination, Blog } from '@/types';
import { ShieldAlert, RefreshCw, Phone, Mail, Calendar, User, CheckCircle2, Clock, ArrowLeft, PlusCircle, Trash2, LogOut, MapPin, DollarSign, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'create-tour' | 'create-place' | 'create-blog' | 'manage-tours' | 'manage-places' | 'manage-blogs'>('leads');

  // Admin Tours State
  const [adminTours, setAdminTours] = useState<TourPackage[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);

  // Admin Places State
  const [adminDestinations, setAdminDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  // Admin Blogs State
  const [adminBlogs, setAdminBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  // Leads State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // New Tour Form State
  const [tourTitle, setTourTitle] = useState('');
  const [tourLocation, setTourLocation] = useState('');
  const [tourCategory, setTourCategory] = useState<'domestic' | 'international'>('domestic');
  const [tourPrice, setTourPrice] = useState('');
  const [tourOriginalPrice, setTourOriginalPrice] = useState('');
  const [tourNights, setTourNights] = useState('5');
  const [tourDays, setTourDays] = useState('6');
  const [tourImageUrl, setTourImageUrl] = useState('');
  const [tourHighlight1, setTourHighlight1] = useState('');
  const [tourHighlight2, setTourHighlight2] = useState('');
  const [tourSubmitting, setTourSubmitting] = useState(false);
  const [tourMsg, setTourMsg] = useState('');

  // New Place Form State
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState<'domestic' | 'international'>('domestic');
  const [placeImageUrl, setPlaceImageUrl] = useState('');
  const [placeSubmitting, setPlaceSubmitting] = useState(false);
  const [placeMsg, setPlaceMsg] = useState('');
  const [placeSubmitted, setPlaceSubmitted] = useState(false);

  // New Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [blogMsg, setBlogMsg] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setBlogMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(`blog-${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(`blog-${fileName}`);
      setBlogImageUrl(data.publicUrl);
      setBlogMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setBlogMsg(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePlaceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setPlaceMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(`place-${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(`place-${fileName}`);
      setPlaceImageUrl(data.publicUrl);
      setPlaceMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setPlaceMsg(`Error uploading image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setTourMsg('Uploading image...');
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName);
      setTourImageUrl(data.publicUrl);
      setTourMsg('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      setTourMsg(`Error uploading image: ${error.message || 'Unknown error'}. Did you create the "tour-images" bucket?`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('exporio_admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
      fetchLeads();
      fetchAdminTours();
      fetchAdminDestinations();
      fetchAdminBlogs();
    }
  }, []);

  const fetchAdminTours = async () => {
    setLoadingTours(true);
    const data = await getTours();
    setAdminTours(data);
    setLoadingTours(false);
  };

  const fetchAdminDestinations = async () => {
    setLoadingDestinations(true);
    const data = await getDestinations();
    setAdminDestinations(data);
    setLoadingDestinations(false);
  };

  const fetchAdminBlogs = async () => {
    setLoadingBlogs(true);
    const data = await getBlogs();
    setAdminBlogs(data);
    setLoadingBlogs(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('Please enter valid email and password.');
      return;
    }
    if (supabase) {
      const { data: isValid, error } = await supabase.rpc('verify_admin_login', {
        admin_email: adminEmail,
        admin_password: adminPassword,
      });
      if (error || !isValid) {
        setLoginError(error?.message || 'Invalid email or password.');
      } else {
        setIsAuthenticated(true);
        localStorage.setItem('exporio_admin_session', 'true');
        fetchLeads();
        fetchAdminTours();
        fetchAdminDestinations();
        fetchAdminBlogs();
      }
    } else {
      setLoginError('Database connection not established.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('exporio_admin_session');
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    const data = await getAllInquiries();
    setInquiries(data);
    setLoadingLeads(false);
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteInquiry(id);
      fetchLeads();
    }
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setTourSubmitting(true);
    setTourMsg('');

    const highlights = [tourHighlight1, tourHighlight2].filter(Boolean);
    
    let res;
    if (editingTourId) {
      // Update existing tour
      res = await updateTour(editingTourId, {
        title: tourTitle,
        location: tourLocation,
        category: tourCategory,
        price: parseFloat(tourPrice) || 9999,
        originalPrice: tourOriginalPrice ? parseFloat(tourOriginalPrice) : undefined,
        durationNights: parseInt(tourNights) || 5,
        durationDays: parseInt(tourDays) || 6,
        imageUrl: tourImageUrl || undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
      });
      if (res.success) {
        setEditingTourId(null);
        fetchAdminTours();
      }
    } else {
      // Create new tour
      const baseSlug = tourTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const slug = `${baseSlug}-${randomSuffix}`;
      
      res = await createTour({
        title: tourTitle,
        slug,
        location: tourLocation,
        category: tourCategory,
        price: parseFloat(tourPrice) || 9999,
        originalPrice: tourOriginalPrice ? parseFloat(tourOriginalPrice) : undefined,
        durationNights: parseInt(tourNights) || 5,
        durationDays: parseInt(tourDays) || 6,
        rating: 5.0,
        reviewCount: 10,
        imageUrl: tourImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        highlights: highlights.length > 0 ? highlights : ['Customized Itinerary', 'Luxury Hotel Stay'],
        isFeatured: true,
        isTrending: true,
      });

      if (res.success) {
        const notifyRes = await notifySubscribers(slug);
        res = {
          ...res,
          message: notifyRes.success
            ? `${res.message} ${notifyRes.message}`
            : `${res.message} (Subscriber email failed: ${notifyRes.message})`,
        };
      }
    }

    setTourMsg(res.message);
    setTourSubmitting(false);
    
    if (res.success && !editingTourId) {
      setTourTitle('');
      setTourLocation('');
      setTourPrice('');
      setTourOriginalPrice('');
      setTourImageUrl('');
      setTourHighlight1('');
      setTourHighlight2('');
    }
  };

  const handleEditTour = (tour: TourPackage) => {
    setEditingTourId(tour.id!);
    setTourTitle(tour.title);
    setTourLocation(tour.location);
    setTourCategory(tour.category);
    setTourPrice(tour.price.toString());
    setTourOriginalPrice(tour.originalPrice ? tour.originalPrice.toString() : '');
    setTourNights(tour.durationNights.toString());
    setTourDays(tour.durationDays.toString());
    setTourImageUrl(tour.imageUrl);
    setTourHighlight1(tour.highlights[0] || '');
    setTourHighlight2(tour.highlights[1] || '');
    setActiveTab('create-tour');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTour = async (id: string) => {
    if (confirm('Are you sure you want to delete this tour package?')) {
      await deleteTour(id);
      fetchAdminTours();
    }
  };

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaceSubmitting(true);
    setPlaceMsg('');

    let res;
    if (editingDestinationId) {
      res = await updateDestination(editingDestinationId, {
        name: placeName,
        category: placeCategory,
        imageUrl: placeImageUrl || undefined,
      });
      if (res.success) {
        setEditingDestinationId(null);
        fetchAdminDestinations();
      }
    } else {
      const slug = placeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      res = await createDestination({
        name: placeName,
        slug,
        category: placeCategory,
        imageUrl: placeImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
        packageCount: 12,
      });
    }

    setPlaceMsg(res.message);
    setPlaceSubmitting(false);

    if (res.message.includes('successfully') && !editingDestinationId) {
      setPlaceSubmitted(true);
      setPlaceName('');
      setPlaceImageUrl('');
    }
  };

  const handleEditPlace = (place: Destination) => {
    setEditingDestinationId(place.id!);
    setPlaceName(place.name);
    setPlaceCategory(place.category);
    setPlaceImageUrl(place.imageUrl);
    setActiveTab('create-place');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlace = async (id: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      await deleteDestination(id);
      fetchAdminDestinations();
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogSubmitting(true);
    setBlogMsg('');

    let res;
    if (editingBlogId) {
      res = await updateBlog(editingBlogId, {
        title: blogTitle,
        author: blogAuthor,
        content: blogContent,
        image_url: blogImageUrl || undefined,
      });
      if (res.success) {
        setEditingBlogId(null);
        fetchAdminBlogs();
      }
    } else {
      res = await createBlog({
        title: blogTitle,
        author: blogAuthor,
        content: blogContent,
        image_url: blogImageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
      });
    }

    setBlogMsg(res.message);
    setBlogSubmitting(false);
    
    if (res.success && !editingBlogId) {
      setBlogTitle('');
      setBlogContent('');
      setBlogAuthor('');
      setBlogImageUrl('');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id!);
    setBlogTitle(blog.title);
    setBlogAuthor(blog.author);
    setBlogContent(blog.content);
    setBlogImageUrl(blog.image_url);
    setActiveTab('create-blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      await deleteBlog(id);
      fetchAdminBlogs();
    }
  };

  // If NOT authenticated, show Admin Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] flex items-center justify-center p-4">
        <div className="bg-navyBlue text-white w-full max-w-md p-8 rounded-2xl border border-slate-700 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primaryCyan to-blue-600 flex items-center justify-center mx-auto mb-3 border border-slate-700 shadow-glow">
              <ShieldAlert className="w-8 h-8 text-navyDark font-extrabold" />
            </div>
            <h2 className="text-2xl font-black text-white">Exporio Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in with your admin credentials to access leads & packages.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 text-xs rounded-xl mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@exporio.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-glow transition-all"
            >
              ACCESS ADMIN DASHBOARD
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-primaryCyan">
              ← Return to Exporio Holidays Main Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-b from-navyDark via-[#1a1a4e] to-[#2d1b4e] text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primaryCyan hover:underline mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Main Site
            </Link>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-accentGold" />
              <h1 className="text-2xl md:text-3xl font-black text-white">Exporio Admin Dashboard</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage lead inquiries, publish new tour packages, and add tourist places.</p>
          </div>


        </div>

        <div className="flex flex-wrap items-center bg-navyBlue p-1.5 rounded-2xl border border-slate-800 mb-8 max-w-4xl gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'leads' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Lead Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-tours')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'manage-tours' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Manage Tours</span>
          </button>

          <button
            onClick={() => {
              setEditingTourId(null);
              setTourTitle('');
              setTourLocation('');
              setTourPrice('');
              setTourOriginalPrice('');
              setTourImageUrl('');
              setTourHighlight1('');
              setTourHighlight2('');
              setActiveTab('create-tour');
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'create-tour' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Tour</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-places')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'manage-places' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Manage Places</span>
          </button>

          <button
            onClick={() => {
              setEditingDestinationId(null);
              setPlaceName('');
              setPlaceImageUrl('');
              setPlaceSubmitted(false);
              setActiveTab('create-place');
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'create-place' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Place</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-blogs')}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'manage-blogs' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Manage Blogs</span>
          </button>

          <button
            onClick={() => {
              setEditingBlogId(null);
              setBlogTitle('');
              setBlogContent('');
              setBlogAuthor('');
              setBlogImageUrl('');
              setActiveTab('create-blog');
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${activeTab === 'create-blog' ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Blog</span>
          </button>
        </div>

        {/* TAB 1: LEADS MANAGER */}
        {activeTab === 'leads' && (
          <div>
            {loadingLeads ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Fetching inquiries from database...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Inquiries Received Yet</h3>
                <p className="text-xs text-slate-400 mb-4">When customers submit quotes or booking forms on the website, their details will appear here in real-time.</p>
              </div>
            ) : (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navyDark text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Customer Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Requested Package</th>
                        <th className="px-6 py-4">Travel Date & Guests</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {inquiries.map((inq, idx) => (
                        <tr key={inq.id || idx} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primaryCyan" />
                              <span>{inq.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <a href={`tel:${inq.phone}`} className="flex items-center gap-1.5 text-slate-200 hover:text-primaryCyan font-semibold">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{inq.phone}</span>
                            </a>
                            {inq.email && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{inq.email}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-primaryCyan">
                            {inq.tourTitle || 'General Quote Inquiry'}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            <div>Date: {inq.travelDate || 'Flexible'}</div>
                            <div className="text-[11px] text-slate-400">Guests: {inq.guestsCount || 2} Persons</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{inq.status || 'Received'}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => inq.id && handleDeleteInquiry(inq.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.5: MANAGE TOURS */}
        {activeTab === 'manage-tours' && (
          <div>
            {loadingTours ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Fetching tours from database...</p>
              </div>
            ) : adminTours.length === 0 ? (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Tours Found</h3>
                <p className="text-xs text-slate-400 mb-4">You haven't created any tour packages yet.</p>
              </div>
            ) : (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navyDark text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Title & Location</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminTours.map((tour) => (
                        <tr key={tour.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={tour.imageUrl} alt={tour.title} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-sm mb-1">{tour.title}</div>
                            <div className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {tour.location}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-primaryCyan">
                            ₹{tour.price.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {tour.durationDays}D / {tour.durationNights}N
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditTour(tour)}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => tour.id && handleDeleteTour(tour.id)}
                                className="p-1.5 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                                title="Delete Tour"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.6: MANAGE PLACES */}
        {activeTab === 'manage-places' && (
          <div>
            {loadingDestinations ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Fetching destinations from database...</p>
              </div>
            ) : adminDestinations.length === 0 ? (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Places Found</h3>
                <p className="text-xs text-slate-400 mb-4">You haven't created any destinations yet.</p>
              </div>
            ) : (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navyDark text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Destination Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminDestinations.map((place) => (
                        <tr key={place.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={place.imageUrl} alt={place.name} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-bold text-white text-sm">
                            {place.name}
                          </td>
                          <td className="px-6 py-4 text-slate-300 capitalize">
                            {place.category}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditPlace(place)}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => place.id && handleDeletePlace(place.id)}
                                className="p-1.5 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                                title="Delete Place"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1.7: MANAGE BLOGS */}
        {activeTab === 'manage-blogs' && (
          <div>
            {loadingBlogs ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-primaryCyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400">Fetching blogs from database...</p>
              </div>
            ) : adminBlogs.length === 0 ? (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Blogs Found</h3>
                <p className="text-xs text-slate-400 mb-4">You haven't created any blogs yet.</p>
              </div>
            ) : (
              <div className="bg-navyBlue border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navyDark text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminBlogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <img src={blog.image_url} alt={blog.title} className="w-16 h-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-bold text-white text-sm">
                            {blog.title}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {blog.author}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditBlog(blog)}
                                className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => blog.id && handleDeleteBlog(blog.id)}
                                className="p-1.5 bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"
                                title="Delete Blog"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE / EDIT NEW TOUR PACKAGE */}
        {activeTab === 'create-tour' && (
          <div className="bg-navyBlue border border-slate-800 rounded-2xl p-6 md:p-8 max-w-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primaryCyan" /> {editingTourId ? 'Edit Tour Package' : 'Add New Tour Package'}
              </h3>
              {editingTourId && (
                <button 
                  onClick={() => {
                    setEditingTourId(null);
                    setTourTitle('');
                    setTourLocation('');
                    setTourPrice('');
                    setTourOriginalPrice('');
                    setTourImageUrl('');
                    setTourHighlight1('');
                    setTourHighlight2('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-6">{editingTourId ? 'Update the details for this tour package.' : 'Fill in the tour details below to publish a new package to your website.'}</p>

            {tourMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{tourMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTour} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tour Package Title *</label>
                <input
                  type="text"
                  required
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  placeholder="e.g. Exotic Sikkim & Gangtok Wonderland Package"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Location / Destination *</label>
                  <input
                    type="text"
                    required
                    value={tourLocation}
                    onChange={(e) => setTourLocation(e.target.value)}
                    placeholder="e.g. Gangtok, Sikkim"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                  <select
                    value={tourCategory}
                    onChange={(e) => setTourCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  >
                    <option value="domestic">Domestic (India)</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Special Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                    placeholder="14999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Original Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    value={tourOriginalPrice}
                    onChange={(e) => setTourOriginalPrice(e.target.value)}
                    placeholder="19999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Number of Nights</label>
                  <input
                    type="number"
                    value={tourNights}
                    onChange={(e) => setTourNights(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Number of Days</label>
                  <input
                    type="number"
                    value={tourDays}
                    onChange={(e) => setTourDays(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image (Upload or Paste URL) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={tourImageUrl}
                    onChange={(e) => setTourImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload Image"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Key Highlight 1</label>
                <input
                  type="text"
                  value={tourHighlight1}
                  onChange={(e) => setTourHighlight1(e.target.value)}
                  placeholder="e.g. Glacial Tsomgo Lake & Nathula Pass Visit"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Key Highlight 2</label>
                <input
                  type="text"
                  value={tourHighlight2}
                  onChange={(e) => setTourHighlight2(e.target.value)}
                  placeholder="e.g. Kanchenjunga View from Pelling Skywalk"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <button
                type="submit"
                disabled={tourSubmitting || isUploadingImage}
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
              >
                {tourSubmitting ? 'Saving Tour...' : (editingTourId ? 'UPDATE TOUR PACKAGE' : 'PUBLISH TOUR PACKAGE')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CREATE NEW PLACE / DESTINATION */}
        {activeTab === 'create-place' && (
          <div className="bg-navyBlue border border-slate-800 rounded-2xl p-6 md:p-8 max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primaryCyan" /> {editingDestinationId ? 'Edit Tourist Place' : 'Add New Tourist Place / Destination'}
              </h3>
              {editingDestinationId && (
                <button 
                  onClick={() => {
                    setEditingDestinationId(null);
                    setPlaceName('');
                    setPlaceImageUrl('');
                    setPlaceSubmitted(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-6">{editingDestinationId ? 'Update the details for this destination.' : 'Add a new destination card to the Popular Destinations grid on the home page.'}</p>

            {placeSubmitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-400">Place Added Successfully!</h4>
                <p className="text-xs text-emerald-100">{placeMsg || 'The new destination has been published.'}</p>
                <button
                  onClick={() => {
                    setPlaceSubmitted(false);
                    setPlaceMsg('');
                  }}
                  className="mt-6 bg-primaryCyan hover:brightness-110 text-navyDark font-extrabold px-6 py-2.5 rounded-xl shadow-glow transition-all text-xs uppercase tracking-wider"
                >
                  Add Another Place
                </button>
              </div>
            ) : (
              <>
                {placeMsg && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs rounded-xl mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{placeMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePlace} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Destination Name *</label>
                    <input
                      type="text"
                      required
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="e.g. Manali & Solang Valley"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                    <select
                      value={placeCategory}
                      onChange={(e) => setPlaceCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                    >
                      <option value="domestic">Domestic (India)</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image (Upload or Paste URL) *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={placeImageUrl}
                        onChange={(e) => setPlaceImageUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePlaceImageUpload}
                          disabled={isUploadingImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          title="Upload Image"
                        />
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {isUploadingImage ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            'Upload'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={placeSubmitting || isUploadingImage}
                    className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
                  >
                    {placeSubmitting ? 'Saving Place...' : (editingDestinationId ? 'UPDATE DESTINATION PLACE' : 'ADD DESTINATION PLACE')}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* TAB 4: CREATE NEW BLOG */}
        {activeTab === 'create-blog' && (
          <div className="bg-navyBlue border border-slate-800 rounded-2xl p-6 md:p-8 max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primaryCyan" /> {editingBlogId ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              {editingBlogId && (
                <button 
                  onClick={() => {
                    setEditingBlogId(null);
                    setBlogTitle('');
                    setBlogContent('');
                    setBlogAuthor('');
                    setBlogImageUrl('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-6">{editingBlogId ? 'Update the details for this blog post.' : 'Write and publish a new blog post directly to your website.'}</p>

            {blogMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{blogMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Blog Title *</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Top 10 Places to Visit in Kerala"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  placeholder="e.g. Admin Team"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cover Image (Upload or Paste URL) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={blogImageUrl}
                    onChange={(e) => setBlogImageUrl(e.target.value)}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageUpload}
                      disabled={isUploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      title="Upload Image"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {isUploadingImage ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        'Upload'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Blog Content *</label>
                <textarea
                  required
                  rows={8}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryCyan resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={blogSubmitting || isUploadingImage}
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-navyDark font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider shadow-glow transition-all disabled:opacity-50"
              >
                {blogSubmitting ? 'Saving Blog...' : (editingBlogId ? 'UPDATE BLOG POST' : 'PUBLISH BLOG')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
