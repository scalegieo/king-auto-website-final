/** Shared dealership contact — keep Visit / Footer / SEO / AI in sync. */

export const DEALERSHIP = {
  name: "King Auto Inc.",
  phoneDisplay: "(303) 502-3022",
  phoneTel: "+13035023022",
  /** schema.org / SEO formatted telephone */
  phoneSchema: "+1-303-502-3022",
  email: "mykingauto@gmail.com",
  addressLine1: "2180 S Havana St",
  addressLine2: "Aurora, CO 80014",
  mapsUrl:
    "https://www.google.com/maps/place/King+Auto+Inc/@39.6769623,-104.8680482,17z/data=!3m1!4b1!4m6!3m5!1s0x876c7d0a8adbba49:0x66b0603228ca10aa!8m2!3d39.6769623!4d-104.8654679!16s%2Fg%2F11mstyqj7w?entry=ttu&g_ep=EgoyMDI2MDkxNS4wIKXMDSoASAFQAw%3D%3D",
  hours: [
    { day: "Monday", time: "10:00 AM – 6:00 PM" },
    { day: "Tuesday", time: "10:00 AM – 6:00 PM" },
    { day: "Wednesday", time: "10:00 AM – 6:00 PM" },
    { day: "Thursday", time: "10:00 AM – 6:00 PM" },
    { day: "Friday", time: "10:00 AM – 6:00 PM" },
    { day: "Saturday", time: "10:00 AM – 6:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
} as const;
