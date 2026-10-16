export const projectTypes = [
  "kitchens-bathrooms",
  "interiors",
  "exteriors",
  "other",
];
export function validateInquiry(input) {
  const errors = {};
  const data = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { data, errors: { form: "Enter your project details." } };
  const limits = {
    name: 100,
    method: 10,
    contact: 254,
    location: 100,
    project: 40,
    description: 2000,
    timeframe: 100,
    website: 200,
  };
  for (const [key, max] of Object.entries(limits)) {
    if (input[key] !== undefined && typeof input[key] !== "string") {
      errors[key] = "Use plain text.";
      data[key] = "";
      continue;
    }
    data[key] = (input[key] || "").trim();
    if (
      data[key].length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data[key])
    )
      errors[key] = `Use no more than ${max} characters of plain text.`;
  }
  for (const key of ["name", "contact", "location", "description"])
    if (!data[key]) errors[key] = "This field is required.";
  if (!["phone", "email"].includes(data.method))
    errors.method = "Choose phone call or email.";
  if (
    data.method === "email" &&
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.contact)
  )
    errors.contact = "Enter a valid email address.";
  if (data.method === "phone") {
    const digits = data.contact.replace(/\D/g, "");
    if (
      !/^[+()\d\s.-]+$/.test(data.contact) ||
      !(
        digits.length === 10 ||
        (digits.length === 11 && digits.startsWith("1"))
      )
    )
      errors.contact = "Enter a 10-digit US phone number, optionally with +1.";
  }
  if (/[\r\n]/.test(data.name + data.contact))
    errors.contact = "Use a single line for name and contact details.";
  if (!projectTypes.includes(data.project))
    errors.project = "Choose a project type.";
  if (data.description && data.description.length < 10)
    errors.description = "Add at least 10 characters about your project.";
  return { data, errors };
}
