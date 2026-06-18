'use client'
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  HiLightningBolt,
  HiOutlineShoppingBag,
  HiOutlineGift,
  HiOutlineLightBulb,
  HiOutlinePlusCircle,
  HiOutlineUserAdd,
  HiOutlineLogout,
  HiOutlineChevronRight,
  HiX,
} from "react-icons/hi";
import { MdOutlineExplore } from "react-icons/md";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { handleLogout } from "@/server/authentication";
import { useUserContext } from "@/contextProvider";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

/* ── Variants ─────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

/* ── Data ─────────────────────────────────────────────────── */
const navItems = [
  { icon: <HiLightningBolt size={16} />,     label: "Popular Products" },
  { icon: <MdOutlineExplore size={16} />,     label: "Explore New" },
  { icon: <HiOutlineShoppingBag size={16} />, label: "Clothing and Shoes" },
  { icon: <HiOutlineGift size={16} />,        label: "Gifts and Living" },
  { icon: <HiOutlineLightBulb size={16} />,   label: "Inspiration" },
];

const quickActions = [
  { icon: <HiOutlinePlusCircle size={15} />, label: "Request a product" },
  { icon: <HiOutlineUserAdd size={15} />,    label: "Add member" },
];

const lastOrders = [
  { initials: "DX", bg: "#e8f0e9", label: "DXC Nike Air Max...", color: "#2d6a3f" },
  { initials: "OW", bg: "#f0ece8", label: "Outerwear Parka...",  color: "#7a5a3a" },
];


/* ── Shared styles ────────────────────────────────────────── */
const sharedStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');

  .sb-root {
    font-family: 'Syne', sans-serif;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    position: relative;
  }
  .sb-root::-webkit-scrollbar { display: none; }

  .sb-root::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 4px;
    background: #0a0a0a;
    z-index: 2;
  }

  .sb-root::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 0;
  }

  .sb-inner {
    position: relative;
    z-index: 1;
    padding: 28px 16px 24px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .sb-brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 4px;
    color: #0a0a0a;
    margin-bottom: 28px;
    padding-left: 4px;
  }

  .sb-section-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #aaa;
    padding-left: 4px;
    margin-bottom: 6px;
  }

  .sb-nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    text-align: left;
    position: relative;
    transition: color 0.15s, background 0.15s;
    border-radius: 0;
  }
  .sb-nav-item:hover { color: #0a0a0a; background: #f4f4f4; }
  .sb-nav-item.active { color: #0a0a0a; font-weight: 700; background: #f4f4f4; }
  .sb-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: #0a0a0a;
  }
  .sb-nav-icon { display: flex; align-items: center; flex-shrink: 0; }

  .sb-qa-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    text-align: left;
    transition: color 0.15s;
    border-radius: 0;
  }
  .sb-qa-item:hover { color: #0a0a0a; }

  .sb-order-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 0;
  }
  .sb-order-row:hover { background: #f4f4f4; }
  .sb-order-left { display: flex; align-items: center; gap: 10px; }
  .sb-order-label {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    color: #444;
    font-weight: 500;
  }
  .sb-view-link {
    font-family: 'Syne', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #0a0a0a;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .sb-see-all {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #888;
    transition: color 0.15s;
  }
  .sb-see-all:hover { color: #0a0a0a; }

  .sb-logout {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #aaa;
    transition: color 0.15s;
    text-align: left;
    border-radius: 0;
  }
  .sb-logout:hover { color: #e53e3e; }

  .sb-separator { height: 1px; background: #e8e8e8; margin: 16px 0; }

  /* ── Hide shadcn's auto-rendered SheetContent close button ── */
  /* We render our own .sb-close-btn inside SidebarContent instead */
  .sb-sheet-close-override > button[data-radix-dialog-close] {
    display: none !important;
  }

  /* ── Our single TANTI-styled close button ── */
  .sb-close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    width: 28px;
    height: 28px;
    border: 1.5px solid #e0e0e0;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
    padding: 0;
    border-radius: 0;
  }
  .sb-close-btn:hover {
    border-color: #0a0a0a;
    box-shadow: 2px 2px 0px #0a0a0a;
    color: #0a0a0a;
  }
`;

/* ── SidebarContent ───────────────────────────────────────── */
function SidebarContent({
  activeNav,
  setActiveNav,
  onItemClick,
}: {
  activeNav: string;
  setActiveNav: (label: string) => void;
  onItemClick?: () => void;
  onClose?: () => void;
}) {
const router=useRouter()
const {setUser,user}=useUserContext()
const logout=async()=>{
  if(!user.isAuthenticated){
    return router.push('/signin')
  }
const res=await handleLogout()
console.log(res)
setUser({role:null,userName:null,profilePicture:null,isAuthenticated:false,email:null,cartCount:0,isLoading:false})
router.push('/signin')
}

  return (
    <>
      <style>{sharedStyles}</style>
      <div className="sb-root">
        <div className="sb-inner">


          {/* Nav */}
          <div className="sb-section-label">Browse</div>
          <motion.nav
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {navItems.map(({ icon, label }) => (
              <motion.div key={label} variants={itemVariants}>
                <button
                  className={`sb-nav-item${activeNav === label ? " active" : ""}`}
                  onClick={() => { setActiveNav(label); onItemClick?.(); }}
                >
                  <span className="sb-nav-icon">{icon}</span>
                  {label}
                </button>
              </motion.div>
            ))}
          </motion.nav>

          <div className="sb-separator" />

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <div className="sb-section-label">Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {quickActions.map(({ icon, label }, i) => (
                <motion.button
                  key={label}
                  className="sb-qa-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.48 + i * 0.07, type: "spring", stiffness: 280, damping: 22 }}
                  whileHover={{ x: 3 }}
                >
                  <span style={{ color: "#aaa", display: "flex" }}>{icon}</span>
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="sb-separator" />

          {/* Last Orders */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="sb-section-label" style={{ margin: 0 }}>Last Orders</div>
              <span style={{
                background: "#0a0a0a", color: "#fff",
                fontFamily: "'Syne', sans-serif",
                fontSize: 9, fontWeight: 700,
                padding: "2px 7px", letterSpacing: "0.1em",
              }}>37</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {lastOrders.map(({ initials, bg, label, color }, i) => (
                <motion.button
                  key={label}
                  className="sb-order-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.63 + i * 0.08, type: "spring", stiffness: 280, damping: 22 }}
                  whileHover={{ x: 2 }}
                >
                  <div className="sb-order-left">
                    <div style={{
                      width: 28, height: 28, background: bg, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color, fontFamily: "'Syne', sans-serif",
                    }}>{initials}</div>
                    <span className="sb-order-label">{label}</span>
                  </div>
                  <span className="sb-view-link">View</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              className="sb-see-all"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.82 }}
              whileHover={{ x: 2 }}
            >
              See all <HiOutlineChevronRight size={11} />
            </motion.button>
          </motion.div>

          <div style={{ flex: 1, minHeight: 24 }} />
          <div className="sb-separator" />

          <motion.button
            className="sb-logout"
            onClick={logout}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.88 }}
          >{
            user?.isAuthenticated?
          <><HiOutlineLogout size={16} />
            Log out</>
            :<>
           <LogIn/> Sign In</>

          }

          </motion.button>
        </div>
      </div>
    </>
  );
}

/* ── Mobile Sheet ─────────────────────────────────────────── */
function MobileSidebar({
  activeNav,
  setActiveNav,
}: {
  activeNav: string;
  setActiveNav: (v: string) => void;
}) {
  return (
    <Sheet>
      {/* Floating trigger */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
        style={{
          position: "fixed",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 50,
        }}
      >
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation"
          >
            <IoIosArrowDroprightCircle size={20} color="#0a0a0a" />
          </button>
        </SheetTrigger>
      </motion.div>

      {/*
        SheetContent automatically renders a close button via shadcn's
        SheetPrimitive.Close. We wrap it in sb-sheet-close-override to
        restyle it — no custom close button needed.
      */}
      <SheetContent
        side="left"
        className="sb-sheet-close-override p-0 border-r border-border"
        style={{ width: "min(260px, 85vw)", fontFamily: "'Syne', sans-serif" }}
      >
        <SidebarContent
          activeNav={activeNav}
          setActiveNav={(label) => {
            setActiveNav(label);
            const closeBtn = document.querySelector(
              "[data-radix-dialog-close]"
            ) as HTMLElement | null;
            closeBtn?.click();
          }}
          onClose={() => {
            const closeBtn = document.querySelector(
              "[data-radix-dialog-close]"
            ) as HTMLElement | null;
            closeBtn?.click();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

/* ── Default export ───────────────────────────────────────── */
export default function Sidebar() {
  const [activeNav, setActiveNav] = useState("Explore New");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <TooltipProvider>
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          style={{
            width: 240,
            height: "100%",
            background: "#fff",
            borderRight: "1px solid #e8e8e8",
            flexShrink: 0,
          }}
        >
          <SidebarContent activeNav={activeNav} setActiveNav={setActiveNav} />
        </motion.div>
      )}

      {isMobile && (
        <MobileSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      )}
    </TooltipProvider>
  );
}