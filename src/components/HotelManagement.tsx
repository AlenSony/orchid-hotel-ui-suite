"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Bed, Receipt, UtensilsCrossed, Search, FileText, X, Plus, Minus } from "lucide-react";

// Types
type RoomType = "Single" | "Double" | "Suite" | "Deluxe";
type RoomStatus = "Available" | "Occupied" | "Maintenance";
type MenuCategory = "Starter" | "Main" | "Dessert" | "Beverage";

interface Room {
  id: number;
  roomNo: string;
  type: RoomType;
  price: number;
  status: RoomStatus;
}

interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Booking {
  id: number;
  guestName: string;
  roomNo: string;
  checkIn: string;
  checkOut: string;
  roomId: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: MenuCategory;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

interface Order {
  id: number;
  guestName: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
}

interface Bill {
  id: number;
  guestName: string;
  roomNo: string;
  nights: number;
  roomCharge: number;
  services: number;
  total: number;
  date: string;
}

// Initial Data
const initialRooms: Room[] = [
  { id: 1, roomNo: "101", type: "Single", price: 80, status: "Available" },
  { id: 2, roomNo: "102", type: "Single", price: 80, status: "Occupied" },
  { id: 3, roomNo: "201", type: "Double", price: 120, status: "Available" },
  { id: 4, roomNo: "202", type: "Double", price: 120, status: "Available" },
  { id: 5, roomNo: "301", type: "Suite", price: 200, status: "Available" },
  { id: 6, roomNo: "302", type: "Suite", price: 200, status: "Maintenance" },
  { id: 7, roomNo: "401", type: "Deluxe", price: 300, status: "Available" },
  { id: 8, roomNo: "402", type: "Deluxe", price: 300, status: "Occupied" },
];

const initialGuests: Guest[] = [
  { id: 1, name: "John Doe", phone: "+1-555-0101", email: "john@example.com", address: "123 Main St, New York" },
  { id: 2, name: "Jane Smith", phone: "+1-555-0102", email: "jane@example.com", address: "456 Oak Ave, Boston" },
  { id: 3, name: "Mike Johnson", phone: "+1-555-0103", email: "mike@example.com", address: "789 Pine Rd, Chicago" },
];

const menuItems: MenuItem[] = [
  { id: 1, name: "Caesar Salad", price: 12, category: "Starter" },
  { id: 2, name: "Soup of the Day", price: 8, category: "Starter" },
  { id: 3, name: "Bruschetta", price: 10, category: "Starter" },
  { id: 4, name: "Grilled Salmon", price: 28, category: "Main" },
  { id: 5, name: "Beef Steak", price: 35, category: "Main" },
  { id: 6, name: "Vegetarian Pasta", price: 18, category: "Main" },
  { id: 7, name: "Chicken Alfredo", price: 22, category: "Main" },
  { id: 8, name: "Chocolate Cake", price: 9, category: "Dessert" },
  { id: 9, name: "Ice Cream Sundae", price: 7, category: "Dessert" },
  { id: 10, name: "Tiramisu", price: 10, category: "Dessert" },
  { id: 11, name: "Fresh Orange Juice", price: 5, category: "Beverage" },
  { id: 12, name: "Coffee", price: 4, category: "Beverage" },
  { id: 13, name: "Wine", price: 15, category: "Beverage" },
];

export default function HotelManagement() {
  const [activeSection, setActiveSection] = useState("rooms");
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [guests] = useState<Guest[]>(initialGuests);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    checkIn: "",
    checkOut: "",
  });

  // Billing State
  const [billingForm, setBillingForm] = useState({
    guestName: "",
    roomNo: "",
    nights: 0,
    roomPrice: 0,
    services: 0,
  });

  // Restaurant State
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderGuestName, setOrderGuestName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>("Starter");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("guests");

  // Refs for smooth scrolling
  const roomsRef = useRef<HTMLDivElement>(null);
  const billingRef = useRef<HTMLDivElement>(null);
  const restaurantRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {
      rooms: roomsRef,
      billing: billingRef,
      restaurant: restaurantRef,
      search: searchRef,
    };
    refs[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Room Booking Functions
  const openBookingModal = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleBookRoom = () => {
    if (!selectedRoom || !bookingForm.guestName || !bookingForm.checkIn || !bookingForm.checkOut) {
      alert("Please fill all fields");
      return;
    }

    const newBooking: Booking = {
      id: Date.now(),
      guestName: bookingForm.guestName,
      roomNo: selectedRoom.roomNo,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      roomId: selectedRoom.id,
    };

    setBookings([...bookings, newBooking]);
    
    // Update room status to Occupied
    setRooms(rooms.map(r => 
      r.id === selectedRoom.id ? { ...r, status: "Occupied" as RoomStatus } : r
    ));

    setBookingModalOpen(false);
    setBookingForm({ guestName: "", checkIn: "", checkOut: "" });
    setSelectedRoom(null);
  };

  // Billing Functions
  const calculateTotal = () => {
    const roomTotal = billingForm.nights * billingForm.roomPrice;
    return roomTotal + billingForm.services;
  };

  const handleGenerateBill = () => {
    if (!billingForm.guestName || !billingForm.roomNo || billingForm.nights <= 0) {
      alert("Please fill all required fields");
      return;
    }

    const newBill: Bill = {
      id: Date.now(),
      guestName: billingForm.guestName,
      roomNo: billingForm.roomNo,
      nights: billingForm.nights,
      roomCharge: billingForm.nights * billingForm.roomPrice,
      services: billingForm.services,
      total: calculateTotal(),
      date: new Date().toLocaleDateString(),
    };

    setBills([...bills, newBill]);
    setBillingForm({ guestName: "", roomNo: "", nights: 0, roomPrice: 0, services: 0 });
  };

  // Restaurant Functions
  const addToOrder = (item: MenuItem) => {
    const existingItem = currentOrder.find(o => o.menuItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(o =>
        o.menuItem.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
      ));
    } else {
      setCurrentOrder([...currentOrder, { menuItem: item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCurrentOrder(currentOrder.map(o =>
      o.menuItem.id === itemId ? { ...o, quantity: Math.max(0, o.quantity + change) } : o
    ).filter(o => o.quantity > 0));
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (currentOrder.length === 0 || !orderGuestName) {
      alert("Please add items and enter guest name");
      return;
    }

    const newOrder: Order = {
      id: Date.now(),
      guestName: orderGuestName,
      items: [...currentOrder],
      total: getOrderTotal(),
      timestamp: new Date().toLocaleString(),
    };

    setOrders([...orders, newOrder]);
    setCurrentOrder([]);
    setOrderGuestName("");
  };

  // Search & Filter Functions
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    switch (searchType) {
      case "guests":
        return guests.filter(g => 
          g.name.toLowerCase().includes(query) ||
          g.email.toLowerCase().includes(query) ||
          g.phone.includes(query)
        );
      case "bookings":
        return bookings.filter(b =>
          b.guestName.toLowerCase().includes(query) ||
          b.roomNo.includes(query)
        );
      case "orders":
        return orders.filter(o =>
          o.guestName.toLowerCase().includes(query) ||
          o.id.toString().includes(query)
        );
      default:
        return [];
    }
  };

  const generateReport = () => {
    const reportData = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === "Available").length,
      occupiedRooms: rooms.filter(r => r.status === "Occupied").length,
      totalBookings: bookings.length,
      totalOrders: orders.length,
      totalRevenue: bills.reduce((sum, b) => sum + b.total, 0) + orders.reduce((sum, o) => sum + o.total, 0),
    };

    const reportText = `
HOTEL MANAGEMENT SYSTEM REPORT
Generated: ${new Date().toLocaleString()}
================================

ROOM STATISTICS:
- Total Rooms: ${reportData.totalRooms}
- Available: ${reportData.availableRooms}
- Occupied: ${reportData.occupiedRooms}

OPERATIONS:
- Total Bookings: ${reportData.totalBookings}
- Total Orders: ${reportData.totalOrders}

FINANCIAL:
- Total Revenue: $${reportData.totalRevenue.toFixed(2)}
    `;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotel-report-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b-4 border-gray-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              <Hotel className="w-8 h-8 text-gray-700" />
              Orchid Hotel
            </div>
            <div className="flex gap-6">
              {[
                { id: "rooms", label: "Room Booking", icon: Bed },
                { id: "billing", label: "Billing", icon: Receipt },
                { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
                { id: "search", label: "Search & Reports", icon: Search },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg scale-105"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Room Booking Section */}
        <section ref={roomsRef} id="rooms" className="scroll-mt-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Room Booking System
            </h2>
            <p className="text-gray-600">Browse available rooms and make reservations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="h-48 bg-gradient-to-br from-gray-400 to-gray-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <Bed className="w-24 h-24 text-white opacity-50" />
                  </div>
                  <Badge
                    className={`absolute top-4 right-4 ${
                      room.status === "Available"
                        ? "bg-green-500"
                        : room.status === "Occupied"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {room.status}
                  </Badge>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Room {room.roomNo}</h3>
                      <p className="text-gray-600 font-medium">{room.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-700">${room.price}</p>
                      <p className="text-sm text-gray-500">per night</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => openBookingModal(room)}
                    disabled={room.status !== "Available"}
                    className={`w-full rounded-full ${
                      room.status === "Available"
                        ? "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black"
                        : ""
                    }`}
                  >
                    {room.status === "Available" ? "Book Now" : "Unavailable"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Bookings Table */}
          {bookings.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Current Bookings</h3>
              <Card className="overflow-hidden border-2 border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Guest Name</th>
                        <th className="px-6 py-4 text-left">Room</th>
                        <th className="px-6 py-4 text-left">Check-in</th>
                        <th className="px-6 py-4 text-left">Check-out</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {bookings.map((booking, idx) => (
                        <tr key={booking.id} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-6 py-4 font-medium">{booking.guestName}</td>
                          <td className="px-6 py-4">{booking.roomNo}</td>
                          <td className="px-6 py-4">{booking.checkIn}</td>
                          <td className="px-6 py-4">{booking.checkOut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </section>

        <Separator className="my-12 bg-gray-200" />

        {/* Billing Section */}
        <section ref={billingRef} id="billing" className="scroll-mt-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Billing System
            </h2>
            <p className="text-gray-600">Generate bills for guest stays and services</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Billing Form */}
            <Card className="p-8 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-2xl font-bold text-gray-700 mb-6">Generate New Bill</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="billGuestName">Guest Name</Label>
                  <Input
                    id="billGuestName"
                    value={billingForm.guestName}
                    onChange={(e) => setBillingForm({ ...billingForm, guestName: e.target.value })}
                    placeholder="Enter guest name"
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="billRoomNo">Room Number</Label>
                  <Input
                    id="billRoomNo"
                    value={billingForm.roomNo}
                    onChange={(e) => setBillingForm({ ...billingForm, roomNo: e.target.value })}
                    placeholder="e.g., 101"
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="billNights">Number of Nights</Label>
                  <Input
                    id="billNights"
                    type="number"
                    value={billingForm.nights || ""}
                    onChange={(e) => setBillingForm({ ...billingForm, nights: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="billRoomPrice">Room Price per Night</Label>
                  <Input
                    id="billRoomPrice"
                    type="number"
                    value={billingForm.roomPrice || ""}
                    onChange={(e) => setBillingForm({ ...billingForm, roomPrice: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="billServices">Additional Services ($)</Label>
                  <Input
                    id="billServices"
                    type="number"
                    value={billingForm.services || ""}
                    onChange={(e) => setBillingForm({ ...billingForm, services: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="border-gray-200 focus:border-gray-400"
                  />
                </div>
                <Separator className="my-4 bg-gray-200" />
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between text-lg font-semibold text-gray-700">
                    <span>Total Amount:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateBill}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-full"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Generate Bill
                </Button>
              </div>
            </Card>

            {/* Bills History */}
            <Card className="p-8 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-2xl font-bold text-gray-700 mb-6">Bills History</h3>
              {bills.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No bills generated yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {bills.map((bill) => (
                    <Card key={bill.id} className="p-4 border border-gray-200 hover:border-gray-400 transition-all">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">{bill.guestName}</p>
                            <p className="text-sm text-gray-600">Room {bill.roomNo}</p>
                          </div>
                          <Badge className="bg-gray-700">${bill.total.toFixed(2)}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Nights: {bill.nights} × ${bill.roomCharge / bill.nights} = ${bill.roomCharge}</p>
                          <p>Services: ${bill.services}</p>
                          <p className="text-xs text-gray-500">{bill.date}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>

        <Separator className="my-12 bg-gray-200" />

        {/* Restaurant Section */}
        <section ref={restaurantRef} id="restaurant" className="scroll-mt-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Restaurant Order Management
            </h2>
            <p className="text-gray-600">Browse menu and place food orders</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu */}
            <Card className="lg:col-span-2 p-6 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Menu</h3>
              <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MenuCategory)}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="Starter">Starters</TabsTrigger>
                  <TabsTrigger value="Main">Mains</TabsTrigger>
                  <TabsTrigger value="Dessert">Desserts</TabsTrigger>
                  <TabsTrigger value="Beverage">Beverages</TabsTrigger>
                </TabsList>
                {(["Starter", "Main", "Dessert", "Beverage"] as MenuCategory[]).map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menuItems
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <Card
                            key={item.id}
                            className="p-4 border border-gray-200 hover:border-gray-400 transition-all hover:shadow-lg bg-white"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-gray-800">{item.name}</h4>
                              <Badge className="bg-gray-700">${item.price}</Badge>
                            </div>
                            <Button
                              onClick={() => addToOrder(item)}
                              size="sm"
                              className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-full"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add to Order
                            </Button>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>

            {/* Current Order Cart */}
            <Card className="p-6 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 h-fit sticky top-24">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Current Order</h3>
              <div className="mb-4">
                <Label htmlFor="orderGuestName">Guest Name</Label>
                <Input
                  id="orderGuestName"
                  value={orderGuestName}
                  onChange={(e) => setOrderGuestName(e.target.value)}
                  placeholder="Enter name or 'Walk-in'"
                  className="border-gray-200 focus:border-gray-400"
                />
              </div>
              <Separator className="my-4 bg-gray-200" />
              {currentOrder.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items added</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {currentOrder.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-600">${item.menuItem.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.menuItem.id, -1)}
                          className="h-8 w-8 p-0 border-gray-300"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.menuItem.id, 1)}
                          className="h-8 w-8 p-0 border-gray-300"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4 bg-gray-200" />
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <div className="flex justify-between text-lg font-bold text-gray-700">
                  <span>Total:</span>
                  <span>${getOrderTotal().toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={placeOrder}
                disabled={currentOrder.length === 0 || !orderGuestName}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-full"
              >
                Place Order
              </Button>
            </Card>
          </div>

          {/* Orders History */}
          {orders.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Order History</h3>
              <Card className="overflow-hidden border-2 border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Order ID</th>
                        <th className="px-6 py-4 text-left">Guest</th>
                        <th className="px-6 py-4 text-left">Items</th>
                        <th className="px-6 py-4 text-left">Total</th>
                        <th className="px-6 py-4 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {orders.map((order, idx) => (
                        <tr key={order.id} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                          <td className="px-6 py-4 font-medium">{order.guestName}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {order.items.map((item, i) => (
                                <div key={i}>
                                  {item.quantity}× {item.menuItem.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-700">${order.total.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </section>

        <Separator className="my-12 bg-gray-200" />

        {/* Search & Reports Section */}
        <section ref={searchRef} id="search" className="scroll-mt-20">
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Search & Reports
            </h2>
            <p className="text-gray-600">Search records and generate reports</p>
          </div>

          <Card className="p-8 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone, room number..."
                  className="border-gray-200 focus:border-gray-400"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full md:w-[200px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guests">Guests</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={generateReport}
                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <Separator className="my-6 bg-gray-200" />

            {/* Search Results */}
            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                {searchType === "guests" ? "Guests" : searchType === "bookings" ? "Bookings" : "Orders"}
              </h3>

              {searchType === "guests" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Name</th>
                        <th className="px-6 py-4 text-left">Phone</th>
                        <th className="px-6 py-4 text-left">Email</th>
                        <th className="px-6 py-4 text-left">Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(getFilteredData() as Guest[]).map((guest, idx) => (
                        <tr key={guest.id} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-6 py-4 font-medium">{guest.name}</td>
                          <td className="px-6 py-4">{guest.phone}</td>
                          <td className="px-6 py-4">{guest.email}</td>
                          <td className="px-6 py-4">{guest.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {searchType === "bookings" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Guest Name</th>
                        <th className="px-6 py-4 text-left">Room</th>
                        <th className="px-6 py-4 text-left">Check-in</th>
                        <th className="px-6 py-4 text-left">Check-out</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(getFilteredData() as Booking[]).map((booking, idx) => (
                        <tr key={booking.id} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-6 py-4 font-medium">{booking.guestName}</td>
                          <td className="px-6 py-4">{booking.roomNo}</td>
                          <td className="px-6 py-4">{booking.checkIn}</td>
                          <td className="px-6 py-4">{booking.checkOut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {searchType === "orders" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">Order ID</th>
                        <th className="px-6 py-4 text-left">Guest</th>
                        <th className="px-6 py-4 text-left">Items</th>
                        <th className="px-6 py-4 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(getFilteredData() as Order[]).map((order, idx) => (
                        <tr key={order.id} className={idx % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                          <td className="px-6 py-4 font-medium">{order.guestName}</td>
                          <td className="px-6 py-4">
                            {order.items.map((item, i) => (
                              <div key={i} className="text-sm">
                                {item.quantity}× {item.menuItem.name}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-700">${order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Book Room {selectedRoom?.roomNo}
            </DialogTitle>
            <DialogDescription>
              {selectedRoom?.type} - ${selectedRoom?.price} per night
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={bookingForm.guestName}
                onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                placeholder="Enter guest name"
                className="border-gray-200 focus:border-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                className="border-gray-200 focus:border-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                className="border-gray-200 focus:border-gray-400"
              />
            </div>
            <Button
              onClick={handleBookRoom}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black rounded-full"
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}