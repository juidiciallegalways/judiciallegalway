import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CaseFileDetailContent } from "@/components/case-files/case-file-detail-content"
import { createClient } from "@/lib/supabase/server"

// Mock data matching the list page
const mockCaseFiles = [
  {
    id: "1",
    title: "Kesavananda Bharati v. State of Kerala",
    description: "Landmark judgment that established the basic structure doctrine of the Indian Constitution. This case is fundamental to understanding constitutional law in India.",
    case_number: "AIR 1973 SC 1461",
    court_name: "Supreme Court of India",
    category: "constitutional",
    subcategory: "Fundamental Rights",
    year: 1973,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    file_url: "/files/kesavananda-bharati.pdf",
    is_premium: false,
    price: 0,
    total_pages: 700,
    is_published: true,
    tags: ["Basic Structure", "Constitutional Amendment", "Fundamental Rights", "Landmark"],
  },
  {
    id: "2",
    title: "Maneka Gandhi v. Union of India",
    description: "Revolutionary judgment that expanded the scope of Article 21 (Right to Life and Personal Liberty). Established that procedure must be just, fair and reasonable.",
    case_number: "AIR 1978 SC 597",
    court_name: "Supreme Court of India",
    category: "constitutional",
    subcategory: "Personal Liberty",
    year: 1978,
    thumbnail_url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800",
    file_url: "/files/maneka-gandhi.pdf",
    is_premium: false,
    price: 0,
    total_pages: 250,
    is_published: true,
    tags: ["Article 21", "Personal Liberty", "Passport", "Landmark"],
  },
  {
    id: "3",
    title: "Vishaka v. State of Rajasthan",
    description: "Landmark case on sexual harassment at workplace. Led to the creation of Vishaka Guidelines which were later codified in the Sexual Harassment Act, 2013.",
    case_number: "AIR 1997 SC 3011",
    court_name: "Supreme Court of India",
    category: "criminal",
    subcategory: "Sexual Harassment",
    year: 1997,
    thumbnail_url: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800",
    file_url: "/files/vishaka.pdf",
    is_premium: true,
    price: 299,
    total_pages: 180,
    is_published: true,
    tags: ["Sexual Harassment", "Workplace", "Women Rights", "PIL"],
  },
  {
    id: "4",
    title: "State of Maharashtra v. Madhukar Narayan",
    description: "Important case dealing with Section 304B IPC (Dowry Death). Discusses the ingredients required to prove dowry death and the presumption under Section 113B of Evidence Act.",
    case_number: "(1991) 1 SCC 57",
    court_name: "Supreme Court of India",
    category: "criminal",
    subcategory: "Dowry Death",
    year: 1991,
    thumbnail_url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800",
    file_url: "/files/madhukar-narayan.pdf",
    is_premium: true,
    price: 199,
    total_pages: 120,
    is_published: true,
    tags: ["Dowry Death", "Section 304B", "Evidence Act", "Criminal Law"],
  },
  {
    id: "5",
    title: "M.C. Mehta v. Union of India (Oleum Gas Leak)",
    description: "Established the principle of absolute liability in cases of hazardous activities. Expanded the scope of Article 21 to include right to a healthy environment.",
    case_number: "AIR 1987 SC 1086",
    court_name: "Supreme Court of India",
    category: "environmental",
    subcategory: "Tort Law",
    year: 1987,
    thumbnail_url: "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800",
    file_url: "/files/mc-mehta-oleum.pdf",
    is_premium: false,
    price: 0,
    total_pages: 200,
    is_published: true,
    tags: ["Absolute Liability", "Environment", "Article 21", "PIL"],
  },
  {
    id: "6",
    title: "Mohori Bibee v. Dharmodas Ghose",
    description: "Classic case on the Indian Contract Act dealing with minors agreements. Established that a minor's agreement is void ab initio.",
    case_number: "(1903) 30 Cal 539",
    court_name: "Privy Council",
    category: "civil",
    subcategory: "Contract Law",
    year: 1903,
    thumbnail_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    file_url: "/files/mohori-bibee.pdf",
    is_premium: true,
    price: 149,
    total_pages: 85,
    is_published: true,
    tags: ["Contract Act", "Minor", "Void Agreement", "Classic Case"],
  },
  {
    id: "7",
    title: "Mohd. Ahmed Khan v. Shah Bano Begum",
    description: "Controversial case dealing with maintenance rights of divorced Muslim women under Section 125 CrPC. Led to the enactment of Muslim Women Act, 1986.",
    case_number: "AIR 1985 SC 945",
    court_name: "Supreme Court of India",
    category: "family",
    subcategory: "Maintenance",
    year: 1985,
    thumbnail_url: "https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=800",
    file_url: "/files/shah-bano.pdf",
    is_premium: false,
    price: 0,
    total_pages: 175,
    is_published: true,
    tags: ["Maintenance", "Muslim Law", "Section 125 CrPC", "Landmark"],
  },
  {
    id: "8",
    title: "Sarla Mudgal v. Union of India",
    description: "Important case on bigamy and conversion. Held that a Hindu husband cannot contract a second marriage by converting to Islam while the first marriage is subsisting.",
    case_number: "AIR 1995 SC 1531",
    court_name: "Supreme Court of India",
    category: "family",
    subcategory: "Marriage",
    year: 1995,
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    file_url: "/files/sarla-mudgal.pdf",
    is_premium: true,
    price: 179,
    total_pages: 140,
    is_published: true,
    tags: ["Bigamy", "Conversion", "Hindu Marriage Act", "Personal Law"],
  },
  {
    id: "9",
    title: "Salomon v. Salomon & Co Ltd",
    description: "Foundational case establishing the principle of separate legal entity and limited liability of companies. Essential for understanding company law.",
    case_number: "[1897] AC 22",
    court_name: "House of Lords",
    category: "corporate",
    subcategory: "Company Law",
    year: 1897,
    thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    file_url: "/files/salomon.pdf",
    is_premium: false,
    price: 0,
    total_pages: 120,
    is_published: true,
    tags: ["Separate Legal Entity", "Limited Liability", "Corporate Veil", "Classic"],
  },
  {
    id: "10",
    title: "Tulsiram v. Ratan Lal",
    description: "Important case on adverse possession under the Limitation Act. Discusses the requirements of continuous, open, and hostile possession.",
    case_number: "AIR 1976 SC 1982",
    court_name: "Supreme Court of India",
    category: "property",
    subcategory: "Adverse Possession",
    year: 1976,
    thumbnail_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    file_url: "/files/tulsiram.pdf",
    is_premium: true,
    price: 249,
    total_pages: 150,
    is_published: true,
    tags: ["Adverse Possession", "Limitation Act", "Property Rights"],
  },
  {
    id: "11",
    title: "Bangalore Water Supply v. A. Rajappa",
    description: "Important case that expanded the definition of 'industry' under the Industrial Disputes Act. Discusses the triple test for determining industry.",
    case_number: "AIR 1978 SC 548",
    court_name: "Supreme Court of India",
    category: "labor",
    subcategory: "Industrial Disputes",
    year: 1978,
    thumbnail_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
    file_url: "/files/rajappa.pdf",
    is_premium: true,
    price: 229,
    total_pages: 190,
    is_published: true,
    tags: ["Industry", "Industrial Disputes Act", "Labor Law", "Triple Test"],
  },
  {
    id: "12",
    title: "Novartis AG v. Union of India",
    description: "Landmark patent case dealing with Section 3(d) of the Patents Act. Rejected patent for Glivec on grounds of lack of enhanced efficacy.",
    case_number: "Civil Appeal No. 2706-2716 of 2013",
    court_name: "Supreme Court of India",
    category: "ipr",
    subcategory: "Patent Law",
    year: 2013,
    thumbnail_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    file_url: "/files/novartis.pdf",
    is_premium: true,
    price: 349,
    total_pages: 280,
    is_published: true,
    tags: ["Patent", "Section 3(d)", "Pharmaceutical", "TRIPS"],
  },
]

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mockCase = mockCaseFiles.find((c) => c.id === id)
  
  return {
    title: mockCase?.title ? `${mockCase.title} | Judicially Legal Ways` : "Case File",
    description: mockCase?.description || "Access landmark case files and judgments",
  }
}

export default async function CaseFileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseFile, error } = await supabase
    .from("case_files")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  // Use mock data if database is empty
  let finalCaseFile = caseFile
  if (error || !caseFile) {
    const mockCase = mockCaseFiles.find((c) => c.id === id)
    if (!mockCase) {
      notFound()
    }
    finalCaseFile = mockCase
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <CaseFileDetailContent caseFile={finalCaseFile} />
      </main>
      <Footer />
    </div>
  )
}
