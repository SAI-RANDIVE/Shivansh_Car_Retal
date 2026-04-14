import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { cars, termsEnglish, termsMarathi } from "./data/cars";
import { currency, imagePath, mainPhotoPath } from "./utils/paths";

const filters = ["all", "hatchback", "sedan", "suv", "mpv", "cng", "automatic"];
const WHATSAPP_NUMBER = "919209944117";
const MAP_ICON = "/map.mp4";
const BOOKING_ICON = "/booking.mp4";
const CONTACT_ICON = "/contact.mp4";
const MAPS_URL = "https://maps.app.goo.gl/yU2BZcrxEpWjUKqn8?g_st=com.google.maps.preview.copy";

function AnimatedIcon({ src, label, className = "media-icon" }) {
  return (
    <video className={className} src={src} aria-label={label} title={label} autoPlay loop muted playsInline />
  );
}

function SignaturePad({ value, onChange, clearSignal }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#0f172a";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (value) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = value;
    }
  }, [value, clearSignal]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const point = event.touches?.[0] || event;
    return {
      x: ((point.clientX - rect.left) * canvas.width) / rect.width,
      y: ((point.clientY - rect.top) * canvas.height) / rect.height
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPoint(event);
    if (!ctx || !point) return;
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    event.preventDefault();
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPoint(event);
    if (!ctx || !point) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    event.preventDefault();
  };

  const endDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  };

  useEffect(() => {
    const handlePointerUp = () => endDrawing();
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!clearSignal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [clearSignal, onChange]);

  return (
    <canvas
      ref={canvasRef}
      width={540}
      height={160}
      className="signature-pad"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
    />
  );
}

function CarImage({ car }) {
  const [src, setSrc] = useState(mainPhotoPath(car.folder));

  return (
    <img
      src={src}
      alt={`${car.name} self drive rental in Pune`}
      onError={() => {
        if (src !== imagePath(car.folder, car.fallbackImage)) {
          setSrc(imagePath(car.folder, car.fallbackImage));
        }
      }}
    />
  );
}

// Date/Time Picker Component
function DateTimePicker({ label, value, onChange }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (value) {
      const dt = new Date(value);
      const dateStr = dt.toISOString().split("T")[0];
      const timeStr = dt.toTimeString().slice(0, 5);
      setDate(dateStr);
      setTime(timeStr);
    }
  }, [value]);

  useEffect(() => {
    if (date && time) {
      onChange(`${date}T${time}`);
    }
  }, [date, time, onChange]);

  return (
    <div className="datetime-picker">
      <label>{label}</label>
      <div className="datetime-inputs">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
    </div>
  );
}

function App() {
  const [filter, setFilter] = useState("all");
  const [lang, setLang] = useState("en");
  const [activeBooking, setActiveBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const [termsDecision, setTermsDecision] = useState("agree");
  const [termsSignature, setTermsSignature] = useState("");
  const [termsClearSignal, setTermsClearSignal] = useState(0);
  
  const [bookingSignature, setBookingSignature] = useState("");
  const [bookingClearSignal, setBookingClearSignal] = useState(0);
  
  const [form, setForm] = useState({
    pickup: "",
    dropoff: "",
    customerName: "",
    customerPhone: "",
    termsDecision: "agree"
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentTerms = lang === "en" ? termsEnglish : termsMarathi;

  const filteredCars = useMemo(() => {
    if (filter === "all") return cars;
    return cars.filter((c) => c.category.includes(filter));
  }, [filter]);

  const selectedCar = useMemo(() => cars.find((c) => c.id === activeBooking) || null, [activeBooking]);

  const durationMs = useMemo(() => {
    const start = new Date(form.pickup);
    const end = new Date(form.dropoff);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    return Math.max(0, end.getTime() - start.getTime());
  }, [form.pickup, form.dropoff]);

  const chargeableBlocks = useMemo(() => {
    if (!durationMs) return 0;
    return Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
  }, [durationMs]);

  const durationText = useMemo(() => {
    if (!durationMs) return "-";
    const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    if (!days) return `${totalHours} hr`;
    if (!hours) return `${days} day`;
    return `${days} day ${hours} hr`;
  }, [durationMs]);

  const estimate = useMemo(() => {
    if (!selectedCar) return 0;
    if (!durationMs) return selectedCar.price;
    return chargeableBlocks * selectedCar.price;
  }, [chargeableBlocks, durationMs, selectedCar]);

  const handleBook = (carId) => {
    setActiveBooking(carId);
    setShowBookingModal(true);
    // Reset form
    setForm({ pickup: "", dropoff: "", customerName: "", customerPhone: "", termsDecision: "agree" });
    setTermsSignature("");
    setBookingSignature("");
    setTermsClearSignal((v) => v + 1);
    setBookingClearSignal((v) => v + 1);
  };

  const closeModal = () => {
    setShowBookingModal(false);
    setActiveBooking(null);
  };

  const loadImageAsDataUrl = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const buildQuotationPdf = async (payload) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 10;

    const ensureSpace = (requiredHeight = 8) => {
      if (y + requiredHeight <= pageHeight - 18) return;
      doc.addPage();
      y = 10;
    };

    // Header with logo and border
    doc.setFillColor(248, 250, 255);
    doc.rect(10, y - 2, pageWidth - 20, 32, "F");
    doc.setDrawColor(47, 128, 237);
    doc.setLineWidth(0.5);
    doc.rect(10, y - 2, pageWidth - 20, 32);

    const logoData = await loadImageAsDataUrl("/assets/img/logo.jpeg");
    if (logoData) {
      doc.addImage(logoData, "JPEG", 12, y, 14, 14);
    }

    const qrData = await loadImageAsDataUrl("/PaymentQR.jpeg");
    if (qrData) {
      doc.addImage(qrData, "JPEG", pageWidth - 34, y + 0.5, 22, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(91, 100, 117);
      doc.text("Payment QR", pageWidth - 23, y + 24.5, { align: "center" });
    }

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 44);
    doc.text("SHIVANSH SELF DRIVE CARS", 30, y + 4);

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(91, 100, 117);
    doc.text("Premium Self-Drive Rental Solution", 30, y + 10);
    y += 40;
    doc.setLineWidth(0.3);
    doc.text("BOOKING DETAILS", 12, y + 1.5);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
    doc.setFillColor(255, 245, 245);

    y += 16;
    const writeTermsSection = (title, lines) => {
      ensureSpace(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(title, 12, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.setTextColor(51, 65, 85);

      lines.forEach((line, index) => {
        const text = `${index + 1}. ${line}`;
        const wrapped = doc.splitTextToSize(text, pageWidth - 24);
        ensureSpace(wrapped.length * 4 + 3);
        doc.text(wrapped, 12, y);
        y += wrapped.length * 4 + 2;
      });
    };

    writeTermsSection("TERMS & CONDITIONS - ENGLISH", termsEnglish);
    y += 6;

    ensureSpace(18);
    doc.setFillColor(245, 248, 255);
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.3);
    doc.rect(10, y - 2, pageWidth - 20, 16, "F");
    doc.rect(10, y - 2, pageWidth - 20, 16);
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);
    const noteText = doc.splitTextToSize(
      "Note: Minimum booking duration is 24 hours. Payment must be made as per the 24 hour booking package.",
      pageWidth - 24
    );
    doc.text(noteText, 12, y + 2.2);

    y += 22;

    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("CUSTOMER SIGNATURES", 12, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(91, 100, 117);
    doc.text("Terms Acceptance Signature", 12, y);
    doc.text("Booking Signature", pageWidth - 70, y);
    y += 2;

    doc.setDrawColor(200, 213, 225);
    doc.setLineWidth(0.4);
    doc.rect(12, y, 82, 24);
    doc.rect(pageWidth - 94, y, 82, 24);
    if (payload.termsSignData) {
      doc.addImage(payload.termsSignData, "PNG", 13, y + 1, 80, 22);
    }
    if (payload.signData) {
      doc.addImage(payload.signData, "PNG", pageWidth - 93, y + 1, 80, 22);
    }

    y += 30;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("www.shivanshselfdrive.com", pageWidth - 12, pageHeight - 10, { align: "right" });

    const pdfBlob = doc.output("blob");
    const fileName = `${payload.name}.pdf`;
    return new File([pdfBlob], fileName, { type: "application/pdf" });
  };

  const downloadPdfFile = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const sendPdfToWhatsApp = async () => {
    if (!selectedCar || !form.customerName.trim() || !/^\d{10}$/.test(form.customerPhone) || !durationMs) {
      window.alert("Please fill all required details correctly.");
      return;
    }

    if (form.termsDecision !== "agree" || termsDecision !== "agree") {
      window.alert("Please agree to Terms & Conditions.");
      return;
    }

    if (!termsSignature) {
      window.alert("Please sign in the Terms section.");
      return;
    }

    if (!bookingSignature) {
      window.alert("Please provide your booking signature.");
      return;
    }

    if (durationMs < 1000 * 60 * 60 * 24) {
      window.alert("Minimum booking duration is 24 hours.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const payload = {
        car: selectedCar.name,
        name: form.customerName.trim(),
        phone: form.customerPhone,
        pickup: form.pickup,
        dropoff: form.dropoff,
        duration: durationText,
        estimate,
        signData: bookingSignature,
        termsSignData: termsSignature
      };

      const quotePdf = await buildQuotationPdf(payload);
      const message = `Hi Shivansh Self Drive!

    I would like to book a ${payload.car}.

    Pickup: ${payload.pickup}
    Dropoff: ${payload.dropoff}
    Requested duration: ${payload.duration}
    Estimated 24 hour package cost: ${currency(payload.estimate)}

    Customer: ${payload.name}
    Phone: ${payload.phone}

    I have signed the terms and conditions. Please find the quotation PDF attached.`;

      // Try to share via native API, fallback to download
      if (navigator.share && navigator.canShare) {
        try {
          if (navigator.canShare({ files: [quotePdf] })) {
            await navigator.share({
              title: "Shivansh Self Drive - Quotation",
              text: message,
              files: [quotePdf]
            });
            setShowBookingModal(false);
            setActiveBooking(null);
            window.alert("Booking shared successfully!");
            return;
          }
        } catch (e) {
          // Fallback below
        }
      }

      // Fallback: Open WhatsApp and suggest attaching PDF
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
      
      // Download PDF
      downloadPdfFile(quotePdf);

      window.alert("WhatsApp opened. Please download the PDF and attach it in the conversation.");
      setShowBookingModal(false);
      setActiveBooking(null);
    } catch (error) {
      window.alert("Error generating PDF. Please try again.");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div>
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="#home" aria-label="Go to homepage">
            <img src="/assets/img/logo.jpeg" alt="Shivansh Self Drive logo" />
            <div>
              <strong>SHIVANSH SELF DRIVE CARS</strong>
              <p>Premium Self-Drive Cars - Pune</p>
            </div>
          </a>

          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#home">Home</a>
            <a href="#fleet">Fleet</a>
          </nav>

          <div className="nav-actions">
            <a className="icon-btn contact" href="#contact" aria-label="Open contact section">
              <AnimatedIcon src={CONTACT_ICON} label="WhatsApp animation" className="icon-video" />
            </a>
            <a
              className="icon-btn location"
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open location"
            >
              <AnimatedIcon src={MAP_ICON} label="Location animation" className="icon-video" />
            </a>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container">
          <div className="hero-badges">
            <span>Premium self-drive in Pune</span>
            <span>Transparent pricing</span>
            <span>Instant WhatsApp booking</span>
          </div>
          <motion.h1 initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            Drive Your Story
          </motion.h1>
          <p>Premium car rental platform with transparent pricing and quick confirmation.</p>
          <div className="hero-actions">
            <a className="hero-btn primary" href="#fleet">Explore Fleet</a>
            <a className="hero-btn ghost" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">Book on WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="container section fleet-section" id="fleet">
        <h2>Our Fleet</h2>
        <div className="tabs">
          {filters.map((f) => (
            <button key={f} className={filter === f ? "tab active" : "tab"} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid">
          {filteredCars.map((car, index) => (
            <motion.article
              key={car.id}
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              whileHover={{ y: -10, rotateX: 1.5 }}
            >
              <div className="img-wrap">
                <CarImage car={car} />
              </div>
              <div className="card-body">
                <div className="card-topline">Premium offer</div>
                <h3>{car.name}</h3>
                <p className="meta">{car.fuel} | {car.transmission}</p>
                <p className="price">{currency(car.price)} <span>{currency(car.originalPrice)}</span></p>
                <p className="pill">Extra hour: {currency(car.extraHour)}</p>
                <button className="book-btn book-btn-with-icon" onClick={() => handleBook(car.id)} aria-label={`Book ${car.name}`}>
                  <AnimatedIcon src={BOOKING_ICON} label="Booking animation" className="button-icon" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Comprehensive Booking Modal */}
      {showBookingModal && selectedCar && (
        <div className="booking-modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <div className="modal-header">
              <h2>Complete Your Booking</h2>
              <p className="modal-subheader">{selectedCar.name}</p>
            </div>

            <div className="modal-content">
              {/* Booking Form Section */}
              <div className="modal-section">
                <h3>Booking Details</h3>
                <div className="form-group">
                  <DateTimePicker
                    label="Pickup Date & Time"
                    value={form.pickup}
                    onChange={(val) => setForm({ ...form, pickup: val })}
                  />
                  <DateTimePicker
                    label="Dropoff Date & Time"
                    value={form.dropoff}
                    onChange={(val) => setForm({ ...form, dropoff: val })}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (10 digits) *"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    pattern="[0-9]{10}"
                    className="form-input"
                  />
                </div>

                <div className="pricing-info">
                  <div className="price-row">
                    <span>24 Hours Package:</span>
                    <span className="price-bold">{currency(selectedCar.price)}</span>
                  </div>
                  {durationText !== "-" && (
                    <>
                      <div className="price-row">
                        <span>Chargeable Blocks:</span>
                        <span>{chargeableBlocks} x 24 hours</span>
                      </div>
                      <div className="price-row total">
                        <span>Estimated Total (24 Hours):</span>
                        <span className="price-bold highlight">{currency(estimate)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Section */}
              <div className="modal-section">
                <h3>Terms & Conditions</h3>
                <div className="lang-tabs">
                  <button
                    className={lang === "en" ? "tab active" : "tab"}
                    onClick={() => setLang("en")}
                  >
                    English
                  </button>
                  <button
                    className={lang === "mr" ? "tab active" : "tab"}
                    onClick={() => setLang("mr")}
                  >
                    Marathi
                  </button>
                </div>
                <div className="terms-list">
                  {currentTerms.map((line) => (
                    <div key={line} className="term-item">
                      <span className="term-bullet">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>

                <div className="decision-row">
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      checked={termsDecision === "agree"}
                      onChange={() => setTermsDecision("agree")}
                    />
                    <span>I Agree to Terms & Conditions</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      checked={termsDecision === "disagree"}
                      onChange={() => setTermsDecision("disagree")}
                    />
                    <span>I Disagree</span>
                  </label>
                </div>

                <div className="sign-panel">
                  <p className="sign-label">Sign here to accept Terms & Conditions *</p>
                  <SignaturePad value={termsSignature} onChange={setTermsSignature} clearSignal={termsClearSignal} />
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => setTermsClearSignal((v) => v + 1)}
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* Booking Signature Section */}
              <div className="modal-section">
                <h3>Booking Signature</h3>
                <p className="sign-label">Provide your booking signature *</p>
                <SignaturePad value={bookingSignature} onChange={setBookingSignature} clearSignal={bookingClearSignal} />
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setBookingClearSignal((v) => v + 1)}
                >
                  Clear Signature
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal} disabled={isGeneratingPdf}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={sendPdfToWhatsApp}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Generating PDF..." : "Generate PDF & Send to WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="container section contact-section" id="contact">
        <div className="contact-card">
          <div className="contact-copy">
            <div className="contact-details">
              <a href="tel:+919175799251">9175799251</a>
              <a href="mailto:sai.randive.btech2024@sitpune.edu.in">sai.randive.btech2024@sitpune.edu.in</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="credits container">
        <p>
          <a href="#contact">Website by Sai Randive (Pune)</a>
        </p>
        <a className="footer-map-icon" href={MAPS_URL} target="_blank" rel="noreferrer" aria-label="Open Google Map location">
          <AnimatedIcon src={MAP_ICON} label="Map animation" className="contact-map-video" />
        </a>
      </footer>
    </div>
  );
}

export default App;
