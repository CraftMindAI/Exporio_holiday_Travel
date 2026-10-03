'use client';

import React, { useEffect, useState } from 'react';
import { uploadImage, createTour, getTours, updateTour, deleteTour, createDestination, getDestinations, updateDestination, deleteDestination, createBlog, getBlogs, updateBlog, deleteBlog } from '@/lib/api';
import { TourPackage, Destination, Blog } from '@/types';
import Select from '@/components/Select';
import TourForm from '@/components/admin/TourForm';
import { toast } from '@/lib/toast';
import { COUNTRIES } from '@/config/countries';
import { ShieldAlert, RefreshCw, Phone, Mail, Calendar, User, CheckCircle2, Clock, ArrowLeft, PlusCircle, Trash2, LogOut, MapPin, DollarSign, Sparkles, Image as ImageIcon } from 'lucide-react';

export type ContentSection = 'tours' | 'places' | 'blogs';

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c, label: c }));

const CATEGORY_OPTIONS = [
  { value: 'domestic', label: 'Domestic (India)' },
  { value: 'international', label: 'International' },
];

/** Tour package / place / blog management, shown inside the admin dashboard. */
export default function ContentManager({ section }: { section: ContentSection }) {
  const [activeTab, setActiveTab] = useState<'create-tour' | 'create-place' | 'create-blog' | 'manage-tours' | 'manage-places' | 'manage-blogs'>(`manage-${section}`);

  // Admin Tours State
  const [adminTours, setAdminTours] = useState<TourPackage[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);

  // Admin Places State
  const [adminDestinations, setAdminDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  // Admin Blogs State
  const [adminBlogs, setAdminBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // New Place Form State
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState<'domestic' | 'international'>('domestic');
  const [placeCountry, setPlaceCountry] = useState('');
  const [placeImageUrl, setPlaceImageUrl] = useState('');
  const [placeSubmitting, setPlaceSubmitting] = useState(false);

  // New Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogSubmitting, setBlogSubmitting] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /** Upload the chosen image to Hostinger (FTP) and hand its public URL to `onUrl`. */
  const handleUpload = (prefix: string, onUrl: (url: string) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingImage(true);
      try {
        onUrl(await uploadImage(file, prefix));
        toast.success('Image uploaded successfully!');
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Error uploading image: ${error.message || 'Unknown error'}`);
      } finally {
        setIsUploadingImage(false);
        e.target.value = '';
      }
    };

  const handleBlogImageUpload = handleUpload('blog', setBlogImageUrl);
  const handlePlaceImageUpload = handleUpload('place', setPlaceImageUrl);

  useEffect(() => {
    if (section === 'tours') {
      fetchAdminTours();
      fetchAdminDestinations();
    }
    if (section === 'places') fetchAdminDestinations();
    if (section === 'blogs') fetchAdminBlogs();
  }, [section]);

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

  const handleEditTour = (tour: TourPackage) => {
    setEditingTour(tour);
    setActiveTab('create-tour');
    document.getElementById('admin-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTourSaved = () => {
    setEditingTour(null);
    fetchAdminTours();
    setActiveTab('manage-tours');
  };

  const handleDeleteTour = async (id: string) => {
    if (confirm('Are you sure you want to delete this tour package?')) {
      await deleteTour(id);
      fetchAdminTours();
    }
  };

  /** Clear every field of the place form (back to a blank "Add Place"). */
  const resetPlaceForm = () => {
    setEditingDestinationId(null);
    setPlaceName('');
    setPlaceCategory('domestic');
    setPlaceCountry('');
    setPlaceImageUrl('');
  };

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placeCategory === 'international' && !placeCountry) {
      toast.error('Please select the country for this international place.');
      return;
    }
    if (!placeImageUrl) {
      toast.error('Please upload a cover image or paste an image URL.');
      return;
    }
    setPlaceSubmitting(true);

    const wasEditing = !!editingDestinationId;
    let res;
    if (editingDestinationId) {
      res = await updateDestination(editingDestinationId, {
        name: placeName,
        category: placeCategory,
        country: placeCategory === 'international' ? placeCountry : undefined,
        imageUrl: placeImageUrl,
      });
    } else {
      res = await createDestination({
        name: placeName,
        category: placeCategory,
        country: placeCategory === 'international' ? placeCountry : undefined,
        imageUrl: placeImageUrl,
        packageCount: 12,
      });
    }

    toast.result(res);
    setPlaceSubmitting(false);

    if (res.success) {
      // Blank form after every successful save; after an edit, go back to the list
      resetPlaceForm();
      fetchAdminDestinations();
      if (wasEditing) setActiveTab('manage-places');
    }
  };

  const handleEditPlace = (place: Destination) => {
    setEditingDestinationId(place.id!);
    setPlaceName(place.name);
    setPlaceCategory(place.category);
    setPlaceCountry(place.country ?? '');
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
    if (!blogImageUrl) {
      toast.error('Please upload a cover image or paste an image URL before publishing.');
      return;
    }
    setBlogSubmitting(true);

    let res;
    if (editingBlogId) {
      res = await updateBlog(editingBlogId, {
        title: blogTitle,
        author: blogAuthor,
        content: blogContent,
        image_url: blogImageUrl,
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
        image_url: blogImageUrl,
      });
      if (res.success) fetchAdminBlogs();
    }

    toast.result(res);
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

  const tabClass = (tab: typeof activeTab) =>
    `py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
      activeTab === tab ? 'bg-primaryCyan text-navyDark shadow-glow' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="text-white">
      <div>
        <div className="inline-flex flex-wrap items-center bg-navyBlue p-1.5 rounded-2xl border border-slate-800 mb-6 gap-2">
          {section === 'tours' && (
            <>
              <button onClick={() => setActiveTab('manage-tours')} className={tabClass('manage-tours')}>
                <Sparkles className="w-4 h-4" />
                <span>Manage Tours</span>
              </button>
              <button
                onClick={() => {
                  setEditingTour(null);
                  setActiveTab('create-tour');
                }}
                className={tabClass('create-tour')}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Tour</span>
              </button>
            </>
          )}

          {section === 'places' && (
            <>
              <button onClick={() => setActiveTab('manage-places')} className={tabClass('manage-places')}>
                <MapPin className="w-4 h-4" />
                <span>Manage Places</span>
              </button>
              <button
                onClick={() => {
                  resetPlaceForm();
                  setActiveTab('create-place');
                }}
                className={tabClass('create-place')}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Place</span>
              </button>
            </>
          )}

          {section === 'blogs' && (
            <>
              <button onClick={() => setActiveTab('manage-blogs')} className={tabClass('manage-blogs')}>
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
                className={tabClass('create-blog')}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Blog</span>
              </button>
            </>
          )}
        </div>

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
                            {place.category}{place.category === 'international' && place.country ? ` · ${place.country}` : ''}
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

        {/* TAB 2: CREATE / EDIT TOUR PACKAGE */}
        {activeTab === 'create-tour' && (
          <TourForm
            key={editingTour?.id ?? 'new'}
            tour={editingTour}
            destinations={adminDestinations}
            onSaved={handleTourSaved}
            onCancel={() => {
              setEditingTour(null);
              setActiveTab('manage-tours');
            }}
            onAddPlace={() => {
              window.location.hash = 'places';
            }}
          />
        )}

        {/* TAB 3: CREATE NEW PLACE / DESTINATION */}
        {activeTab === 'create-place' && (
          <div className="bg-navyBlue border border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primaryCyan" /> {editingDestinationId ? 'Edit Tourist Place' : 'Add New Tourist Place / Destination'}
              </h3>
              {editingDestinationId && (
                <button 
                  onClick={() => {
                    resetPlaceForm();
                    setActiveTab('manage-places');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-6">{editingDestinationId ? 'Update the details for this destination.' : 'Add a new destination card to the Popular Destinations grid on the home page.'}</p>

            <>
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
                    <Select
                      ariaLabel="Place category"
                      value={placeCategory}
                      onChange={(v) => setPlaceCategory(v as 'domestic' | 'international')}
                      options={CATEGORY_OPTIONS}
                    />
                  </div>

                  {placeCategory === 'international' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Country *</label>
                      <Select
                        ariaLabel="Country"
                        value={placeCountry}
                        onChange={setPlaceCountry}
                        options={COUNTRY_OPTIONS}
                        placeholder="Select a country"
                        searchable
                        maxVisible={5}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="place-cover" className="block text-xs font-bold text-slate-300 mb-1">
                      Cover Image * <span className="font-normal text-slate-500">(upload or paste a URL)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-3 items-stretch">
                      <label
                        htmlFor="place-cover"
                        className={`relative flex flex-col items-center justify-center gap-1.5 min-h-[120px] rounded-xl border-2 border-dashed overflow-hidden cursor-pointer ${
                          placeImageUrl ? 'border-slate-700' : 'border-slate-600 hover:border-primaryCyan bg-slate-900/60'
                        } ${isUploadingImage ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        {placeImageUrl ? (
                          <>
                            <img src={placeImageUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                            <span className="relative mt-auto mb-2 bg-navyDark/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                              {isUploadingImage ? 'Uploading…' : 'Click to replace'}
                            </span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                            <span className="text-[11px] font-semibold text-slate-300">{isUploadingImage ? 'Uploading…' : 'Upload image'}</span>
                          </>
                        )}
                        <input
                          id="place-cover"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          onChange={handlePlaceImageUpload}
                          disabled={isUploadingImage}
                          className="sr-only"
                        />
                      </label>
                      <div className="flex flex-col justify-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or paste image URL</span>
                        <input
                          type="url"
                          aria-label="Cover image URL"
                          value={placeImageUrl.startsWith('/media/') ? '' : placeImageUrl}
                          onChange={(e) => setPlaceImageUrl(e.target.value.trim())}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                        />
                        {placeImageUrl.startsWith('/media/') && (
                          <span className="text-[11px] text-emerald-400">Uploaded image will be used.</span>
                        )}
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
          </div>
        )}

        {/* TAB 4: CREATE NEW BLOG */}
        {activeTab === 'create-blog' && (
          <div className="bg-navyBlue border border-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-3xl mx-auto shadow-2xl">
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

            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              </div>

              <div>
                <label htmlFor="blog-cover" className="block text-xs font-bold text-slate-300 mb-1">Cover Image * <span className="font-normal text-slate-500">(upload or paste a URL)</span></label>
                <label
                  htmlFor="blog-cover"
                  className={`relative flex flex-col items-center justify-center gap-2 w-full min-h-[160px] rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
                    blogImageUrl ? 'border-slate-700' : 'border-slate-600 hover:border-primaryCyan bg-slate-900/60'
                  } ${isUploadingImage ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {blogImageUrl ? (
                    <>
                      <img src={blogImageUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                      <span className="relative mt-auto mb-3 bg-navyDark/80 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg">
                        {isUploadingImage ? 'Uploading…' : 'Click to replace image'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-7 h-7 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300">{isUploadingImage ? 'Uploading to Hostinger…' : 'Click to upload a cover image'}</span>
                      <span className="text-[11px] text-slate-500">JPG, PNG, WEBP, GIF or AVIF · max 5 MB</span>
                    </>
                  )}
                  <input
                    id="blog-cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleBlogImageUpload}
                    disabled={isUploadingImage}
                    className="sr-only"
                  />
                </label>
                <div className="flex items-center gap-3 my-2">
                  <span className="h-px flex-1 bg-slate-700" />
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">or</span>
                  <span className="h-px flex-1 bg-slate-700" />
                </div>
                <input
                  type="url"
                  aria-label="Cover image URL"
                  value={blogImageUrl.startsWith('/media/') ? '' : blogImageUrl}
                  onChange={(e) => setBlogImageUrl(e.target.value.trim())}
                  placeholder="Paste image URL, e.g. https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Blog Content *</label>
                <textarea
                  required
                  rows={12}
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
