export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "afventer":
      return "bg-red-500 text-white border-red-500"
    case "i produktion":
      return "bg-yellow-400 text-black border-yellow-400"
    case "kjole ankommet":
      return "bg-green-500 text-white border-green-500"
    case "kjole afhentet":
      return "bg-black text-white border-black"
    default:
      return "bg-gray-200 text-gray-800 border-gray-200"
  }
}

export function getCustomerFriendlyStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "afventer":
      return "Ordre modtaget"
    case "i produktion":
      return "I produktion"
    case "kjole ankommet":
      return "Klar til afhentning"
    case "kjole afhentet":
      return "Afhentet"
    default:
      return status
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "Ikke angivet"
  try {
    return new Date(dateString).toLocaleDateString("da-DK")
  } catch {
    return dateString
  }
}
