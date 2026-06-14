"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, User, Mail, Plus, Pencil, Trash2, Star, CheckCircle2, Shield, Calendar } from "lucide-react";
import useUser from "@/hooks/use_user";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIA_STATES } from "@/store";
import { Address } from "@/server/user/type";
const initialAddresses = [
  {
    label:"",
    id: 1,
    fullName: "John Doe",
    phone: "9876543210",
    line1: "House No. 123",
    line2: "Main Road",
    town: "Jorhat",
    district: "Jorhat",
    state: "Assam",
    pincode: "785001",
    isDefault: true,
    postOffice:""
  },
  {postOffice:"",
    id: 2,
      label:"",
    fullName: "Jane Doe",
    phone: "9123456789",
    line1: "ABC Colony",
    line2: "",
    town: "Guwahati",
    district: "Kamrup",
    state: "Assam",
    pincode: "781001",
    isDefault: false,
  },
];

const emptyForm = {
  fullName: "",
  phone: "",
  label:"",
  line1: "",
  line2: "",
  town: "",
  district: "",
  state: "",
  postOffice:"",
  pincode: "",
};

function getInitials(user: any): string {
  if (user?.firstName && user?.lastName)
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  if (user?.firstName) return user.firstName[0].toUpperCase();
  if (user?.userName) return user.userName.slice(0, 2).toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  return "?";
}

function getDisplayName(user: any): string {
  if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
  if (user?.firstName) return user.firstName;
  if (user?.userName) return user.userName;
  return user?.email ?? "Unknown User";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function AccountPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const { getUser,createAddress } = useUser();
  const { data, isLoading } = getUser();
  const user = data?.data;
    useEffect(()=>{
        if(data&&!isLoading){
            setAddresses(data?.data?.addresses)
        }
    },[data,isLoading])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      label: address.label || "",
      line1: address.line1,
      line2: address.line2 || "",
      town: address.town,
      district: address.district || "",
      state: address.state,
      pincode: address.pincode,
      postOffice: address.postOffice || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleMakeDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleSave = () => {
    if (!form.fullName || !form.line1 || !form.pincode) return;

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
      setEditingId(null);
    } else {
        console.log(form)
        createAddress.mutate(form,{onSuccess:(data: any)=>{
             setAddresses((prev) => [
        ...prev,
        { ...form, id: data?.id || String(Date.now()), isDefault: prev.length === 0, country: "", userId: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
        setForm(emptyForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

        },onError:()=>{}})
    }

  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Profile Card */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <div className="h-2 w-full bg-zinc-700" />
          <CardContent className="pt-6 pb-6">

            {isLoading ? (
              /* Skeleton */
              <div className="flex items-center gap-5 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 shrink-0">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt="Profile picture"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-zinc-200 text-zinc-800 text-xl font-bold">
                      {getInitials(user)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-semibold text-slate-900 truncate">
                      {getDisplayName(user)}
                    </h1>
                    {user?.role && (
                      <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 text-xs font-medium gap-1">
                        <Shield className="h-2.5 w-2.5" />
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  {user?.createdAt && (
                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member since {formatDate(user.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-5" />

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Username</p>
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {isLoading ? (
                      <span className="inline-block h-3 w-20 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      user?.userName ?? "—"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Email</p>
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {isLoading ? (
                      <span className="inline-block h-3 w-36 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      user?.email ?? "—"
                    )}
                  </p>
                </div>
              </div>

              {user?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Section */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* Form */}
          <div className="lg:col-span-2 lg:sticky lg:top-6">
            {isLoading ? (
              /* Form Skeleton */
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                      <div className="h-3 w-48 bg-slate-100 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`${i % 2 === 0 ? "col-span-2" : ""} space-y-1.5`}>
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                        <div className="h-9 w-full bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1 animate-pulse">
                    <div className="flex-1 h-9 bg-slate-200 rounded" />
                    <div className="h-9 w-20 bg-slate-100 rounded" />
                  </div>
                </CardContent>
              </Card>
            ) : (
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-zinc-800" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {editingId ? "Edit Address" : "Add New Address"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {editingId ? "Update the details below" : "Fill in your delivery details"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Label</Label>
                    <Input name="label" value={form.label} onChange={handleChange} placeholder="Home Adress/Office Adress" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Full Name *</Label>
                    <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Phone</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">+91</span>
                      <Input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className="h-9 text-sm pl-10 border-slate-200 focus-visible:ring-zinc-500" />
                    </div>
                  </div>

                             <div className="col-span-2 space-y-1.5">
       <Label className="text-xs font-medium text-slate-600">State *</Label>
       <Select
        value={form.state}
        onValueChange={(val) => setForm((prev) => ({ ...prev, state: val, district: "" }))}
      >
        <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-zinc-500">
          <SelectValue placeholder="Select state" />
        </SelectTrigger>
        <SelectContent className="max-h-60 max-w-50 ">
          {INDIA_STATES.map((s) => (
            <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="col-span-2 space-y-1.5">
       <Label className="text-xs font-medium text-slate-600">District *</Label>
      <Select
        value={form.district}
        onValueChange={(val) => setForm((prev) => ({ ...prev, district: val }))}
        disabled={!form.state}
      >
        <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-zinc-500">
          <SelectValue placeholder={form.state ? "Select district" : "Select a state first"} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {(INDIA_STATES.find((s) => s.state === form.state)?.districts ?? []).map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Post Office</Label>
                    <Input name="postOffice" value={form.postOffice} onChange={handleChange} placeholder="House No., Street" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Address Line 1 *</Label>
                    <Input name="line1" value={form.line1} onChange={handleChange} placeholder="House No., Street" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Address Line 2</Label>
                    <Input name="line2" value={form.line2} onChange={handleChange} placeholder="Apartment, Landmark (optional)" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Town / City</Label>
                    <Input name="town" value={form.town} placeholder="nakpur" onChange={handleChange} className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>



                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Pincode *</Label>
                    <Input name="pincode" value={form.pincode} onChange={handleChange} placeholder="785001" className="h-9 text-sm border-slate-200 focus-visible:ring-zinc-500" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} className="flex-1 h-9 text-sm bg-zinc-800 hover:bg-zinc-900 gap-2">
                    {saved ? (
                      <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                    ) : editingId ? (
                      <><Pencil className="h-4 w-4" /> Update Address</>
                    ) : (
                      <><Plus className="h-4 w-4" /> Save Address</>
                    )}
                  </Button>
                  {editingId && (
                    <Button onClick={handleCancel} variant="outline" className="h-9 text-sm">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Address List */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <>
                {/* Address List Skeleton */}
                <div className="flex items-center justify-between animate-pulse">
                  <div className="h-6 w-40 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                </div>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-white animate-pulse">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
                    <CardContent className="pl-6 pt-5 pb-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded" />
                            <div className="h-3 w-28 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-3.5 w-3.5 bg-slate-200 rounded mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full bg-slate-200 rounded" />
                          <div className="h-3 w-3/4 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                        <div className="h-8 w-24 bg-slate-100 rounded ml-auto" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Saved Addresses</h2>
              <span className="text-sm text-slate-400">{addresses.length} saved</span>
            </div>

            {addresses.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 shadow-none">
                <CardContent className="py-12 flex flex-col items-center text-center gap-2">
                  <MapPin className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">No addresses saved yet</p>
                  <p className="text-xs text-slate-400">Add one using the form</p>
                </CardContent>
              </Card>
            )}

            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`border-0 shadow-sm bg-white transition-all group relative overflow-hidden ${
                  editingId === address.id ? "ring-2 ring-zinc-500" : "hover:shadow-md"
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${address.isDefault ? "bg-zinc-600" : "bg-transparent group-hover:bg-zinc-200"}`} />

                <CardContent className="pl-6 pt-5 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{address.fullName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <p className="text-xs text-slate-400">+91 {address.phone}</p>
                        </div>
                      </div>
                    </div>

                    {address.isDefault && (
                      <Badge className="bg-zinc-50 text-zinc-700 border-zinc-200 font-medium text-xs gap-1 shrink-0">
                        <Star className="h-3 w-3 fill-zinc-500 text-zinc-500" />
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`},{" "}
                      {address.town}, {address.district && `${address.district}, `}
                      {address.state} — {address.pincode}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(address)} className="h-8 text-xs gap-1.5 border-slate-200 hover:border-zinc-400 hover:text-zinc-800">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleDelete(address.id)} className="h-8 text-xs gap-1.5 border-slate-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>

                    {!address.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => handleMakeDefault(address.id)} className="h-8 text-xs gap-1.5 text-slate-500 hover:text-zinc-700 hover:bg-zinc-50 ml-auto">
                        <Star className="h-3 w-3" /> Make Default
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}