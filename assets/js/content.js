/* ============================================================
   AVE Forum — content model
   Everything readable on the platform is defined here.
   Seeded records carry demo:true and render a DEMO badge on the
   card and on the detail page until real records replace them.
   ============================================================ */

export const ORG = {
  name: "AVE Forum",
  full: "African Voice of Emergency Care",
  tagline: "Amplifying Africa's Voice in Emergency Care.",
  promise: "Learn. Connect. Share. Innovate. Lead.",
  email: "hello@aveforum.africa",
  conference: "8th African Conference on Emergency Medicine, Arusha, 11–13 November 2026",
  builder: { name: "LUNO Mwanajando Technologies", url: "https://lunomj.com/lmt.html" }
};

export const FOUNDER = {
  name: "Dr. Michael Joseph Kimario",
  role: "Founder & Visionary",
  title: "Resident in Emergency Medicine",
  institution: "Muhimbili University of Health and Allied Sciences (MUHAS), Tanzania",
  principle: "Founded by one vision. Powered by a continent.",
  signature: "One vision started the journey. Many voices will shape the future.",
  message: [
    "AVE Forum began with a simple belief: Africa's emergency-care community has powerful knowledge, remarkable people, important experiences and transformative ideas that deserve to be connected and amplified.",
    "Across our continent, professionals work every day to provide emergency care, educate future generations, conduct research, strengthen health systems and develop innovative solutions. Yet many of these voices remain separated by geography, institutions, disciplines and systems.",
    "AVE Forum was created to help change that. This is a space to learn from one another, to ask questions, to share evidence, to find mentors and collaborators, to showcase innovation, and to have meaningful conversations about the future of emergency care.",
    "But AVE Forum is not meant to belong to one person. The founder may have started the vision; the strength of AVE Forum will come from the collective contribution of emergency-care professionals across Africa."
  ],
  legacy: "The measure of AVE Forum will not simply be how many people join. It will be the connections created, knowledge shared, research strengthened, professionals mentored, innovations advanced, conversations started, systems influenced, and lives ultimately improved."
};

export const NAV = [
  ["about",      "About"],
  ["explore",    "Explore"],
  ["clinical",   "Clinical Excellence"],
  ["research",   "Research"],
  ["leadership", "Leadership"],
  ["community",  "Community"],
  ["stories",    "Frontline Stories"],
  ["innovation", "Innovation"],
  ["hervoice",   "Her Voice in EM"],
  ["media",      "AVE Media"],
  ["events",     "Events"]
];

export const PILLARS = [
  { id:"clinical", n:"01", name:"Clinical Excellence",
    lede:"Evidence-based emergency medicine, taught by people who practise it in African departments.",
    blurb:"Cases, the Airway Academy, ECG and imaging, trauma and critical care.",
    items:[
      ["Evidence-based emergency medicine education","Referenced teaching on the presentations that fill African emergency departments, written for the equipment and staffing actually available."],
      ["Clinical case discussions","De-identified cases posted by members, discussed openly, with a summary of what the evidence supports."],
      ["Airway Academy","Airway assessment, preparation, drug-assisted intubation, rescue techniques, and the difficult airway without a video laryngoscope."],
      ["ECG and diagnostic imaging","Weekly teaching files with structured interpretation, built into a searchable archive."],
      ["Trauma and critical care updates","Practice-changing evidence summarised for the shift you are about to start."]
    ]},
  { id:"research", n:"02", name:"Research and Evidence Translation",
    lede:"African emergency medicine research exists. It is scattered, and rarely read by the clinicians it describes.",
    blurb:"African Research Spotlight, journal club, mentorship, publication support.",
    items:[
      ["African Research Spotlight","A curated, linked library of peer-reviewed African emergency care research."],
      ["Journal Club","A live monthly appraisal of one paper, recorded and archived with the appraisal checklist."],
      ["Research mentorship","Pairing early-career researchers with established investigators for protocol review and analysis support."],
      ["Grant and publication support","Funding calls, ethics submissions, reporting guidelines, and responding to reviewers."],
      ["Translation into practice","Turning findings into protocols and checklists a department can adopt on Monday."]
    ]},
  { id:"leadership", n:"03", name:"Leadership and Health Systems",
    lede:"Emergency care development takes governance, quality systems, and people willing to run them.",
    blurb:"Department leadership, quality improvement, policy, disaster, EMS.",
    items:[
      ["Emergency department leadership","Rostering, triage design, flow, staff retention, and the management work that decides whether a department functions."],
      ["Quality improvement","Indicator selection, audit cycles and improvement projects, shared as replicable methods."],
      ["Health policy dialogue","Where emergency care sits in national health strategy, financing and universal health coverage."],
      ["Disaster preparedness","Mass casualty planning, surge capacity, and incident command that holds under load."],
      ["EMS development","Building prehospital and referral systems, and the sequencing that makes them survive."]
    ]},
  { id:"community", n:"04", name:"Community and Collaboration",
    lede:"A continent-wide professional community for everyone who works in emergency care, at every level.",
    blurb:"Networking, mentorship, trainees, country representatives, discussion.",
    items:[
      ["Continental networking","Direct contact between clinicians, nurses, paramedics, researchers and educators across more than fifty countries."],
      ["Mentorship programmes","Structured pairing with agreed goals and review points."],
      ["Resident and student engagement","A place for trainees to present cases and find supervision beyond their own institution."],
      ["Country representatives","A named representative in each participating country, drawn from the membership."],
      ["Discussion forums","Open discussion by pillar, moderated, searchable, and archived."]
    ]},
  { id:"stories", n:"05", name:"Frontline Stories",
    lede:"What emergency care actually looks like, told by the people delivering it.",
    blurb:"District hospitals, rural practice, humanitarian settings, lessons learned.",
    items:[
      ["Emergency department experience","First-person accounts of practice under real constraints, published with the author's name and consent."],
      ["Rural emergency care","The clinical and logistical reality outside referral centres, where most of the continent is treated."],
      ["Humanitarian medicine","Emergency care in conflict, displacement and outbreak settings."],
      ["Patient-centred narratives","De-identified accounts that keep the person, not the pathology, at the centre."],
      ["Lessons learned","Near misses and system failures, shared so the next department does not repeat them."]
    ]},
  { id:"innovation", n:"06", name:"Innovation and Digital Health",
    lede:"Technology assessed honestly against African infrastructure, not against marketing claims.",
    blurb:"AI, telemedicine, medical technology, simulation, African innovation.",
    items:[
      ["Artificial intelligence","Triage, decision support and imaging — what is validated, and what needs local data before it can be trusted."],
      ["Telemedicine","Models that survive intermittent connectivity, and the regulation that decides whether they last."],
      ["Medical technology","Devices evaluated for cost, maintenance, consumables and repairability, not only performance."],
      ["Simulation","Low-cost and locally manufactured simulation that works without a dedicated centre."],
      ["African innovations","Innovations built on the continent, profiled by the people who built them."]
    ]},
  { id:"hervoice", n:"07", name:"Her Voice in EM",
    lede:"Women run departments, teach residents, lead research and drive prehospital systems across this continent. They are not equally visible.",
    blurb:"Women leading, teaching, researching and innovating in emergency care.",
    items:[
      ["Interviews","Long-form conversations with women leading emergency departments, training programmes and prehospital services."],
      ["Mentorship","Pairing established women leaders with early-career clinicians, nurses and paramedics."],
      ["Professional storytelling","Written profiles across every discipline in emergency care, not physicians alone."],
      ["Leadership conversations","Negotiation, promotion, caregiving, and the cost of both saying yes and saying no."],
      ["Recognition","Naming and crediting work that has gone unnamed."]
    ]}
];

export const VALUES = [
  ["African-led","Africans set the agenda. Contributors, editors and country representatives come from the continent's own emergency care community."],
  ["Contextual","Guidance is written for the resources available. If a protocol needs equipment most departments do not have, we say so."],
  ["Open","Free to read, free to join, free to reuse in teaching. No paywall between a clinician and the knowledge they need on shift."],
  ["Rigorous","Clinical content is referenced. Research links to source. Nothing is claimed that cannot be checked."],
  ["Interprofessional","Nurses, paramedics, medical officers, technicians and physicians share the same resuscitation room and the same platform."],
  ["Safe","No patient-identifiable information, ever. Cases are de-identified before they are posted."]
];

export const ABOUT = {
  vision: "Every emergency care professional in Africa, wherever they work, has access to the knowledge, the network and the recognition their work deserves.",
  mission: "To connect emergency care professionals across Africa through African-led education, research translation, innovation and collaboration — free at the point of use, built for the bandwidth and the conditions people actually work in.",
  cycle: ["Learn","Discuss","Connect","Collaborate","Innovate","Lead","Impact"],
  story: [
    "Emergency departments are opening across Africa, training programmes are expanding, and prehospital systems are being built. What has not kept pace is a shared place where that work is taught, published, argued over and passed on. Most of what a registrar in Dar es Salaam learns the hard way never reaches the registrar in Kumasi who is about to learn it the same way.",
    "AVE Forum was developed in the Department of Emergency Medicine at Muhimbili University of Health and Allied Sciences, Dar es Salaam, as a conceptual framework and working platform for closing that gap.",
    "The identity carries the intent: deep navy for trust, emergency red for urgency, African gold for innovation, white for clarity. The mark places an electrocardiographic waveform and a microphone over the continent — a pulse, a voice, and the place both belong to."
  ]
};

/* ---------- Research Spotlight: real, verifiable references ---------- */
export const PAPERS = [
  { id:"p1", title:"Emergency care systems in Africa: a focus on quality", authors:"Kannan VC, Tenner A, Sawe HR, Osiro M, Kyobe T, Nahayo E, et al.", journal:"Afr J Emerg Med. 2020;10(Suppl 1):S65–S72", doi:"10.1016/j.afjem.2020.04.010", topic:"Health systems" },
  { id:"p2", title:"Fifteen years of emergency medicine literature in Africa: a scoping review", authors:"Mould-Millman NK, Dixon J, Burkholder TW, Sefa N, Patel H, Yaffee AQ, et al.", journal:"Afr J Emerg Med. 2019;9(1):45–52", doi:"10.1016/j.afjem.2019.01.006", topic:"Research capacity" },
  { id:"p3", title:"Emergency medicine registrar training in Africa: overview of programmes, faculty and sustainability", authors:"Akomeah AO, Sawe HR, Mfinanga JA, Runyon MS, Noste EE.", journal:"Emerg Med J. 2020;37(5):300–305", doi:"10.1136/emermed-2019-208668", topic:"Training" },
  { id:"p4", title:"Professional needs of young emergency medicine specialists in Africa", authors:"Reynolds TA, et al.", journal:"Afr J Emerg Med. 2016;6(2):94–99", doi:"10.1016/j.afjem.2016.02.005", topic:"Workforce" },
  { id:"p5", title:"Emergency care capacity in Africa: a clinical and educational initiative in Tanzania", authors:"Reynolds TA, Mfinanga JA, Sawe HR, Runyon MS, Mwafongo V.", journal:"J Public Health Policy. 2012;33(Suppl 1):S126–S137", doi:"10.1057/jphp.2012.41", topic:"Health systems" },
  { id:"p6", title:"The state of emergency medical services (EMS) systems in Africa", authors:"Mould-Millman NK, Dixon JM, Sefa N, et al.", journal:"Afr J Emerg Med. 2017;7(3):122–127", doi:"10.1016/j.afjem.2017.06.002", topic:"Prehospital" },
  { id:"p7", title:"Strengthening emergency care systems to improve universal health coverage in low- and middle-income countries", authors:"Reynolds TA, Sawe H, Rubiano AM, Shin SD, Wallis L, Mock CN.", journal:"BMJ Glob Health. 2017;2(Suppl 4):e000619", doi:"10.1136/bmjgh-2017-000619", topic:"Policy" },
  { id:"p8", title:"Mentorship in health research institutions in Africa: a systematic review", authors:"Ng'oda M, Gatheru PM, Oyeyemi O, Busienei P, Karugu CH, Mugo S, et al.", journal:"PLOS Glob Public Health. 2024;4(9):e0003314", doi:"10.1371/journal.pgph.0003314", topic:"Mentorship" },
  { id:"p9", title:"Evaluation of e-learning for medical education in low- and middle-income countries: a systematic review", authors:"Barteit S, Guzek D, Jahn A, Bärnighausen T, Jorge MM, Neuhann F.", journal:"Comput Educ. 2020;145:103726", doi:"10.1016/j.compedu.2019.103726", topic:"Education" },
  { id:"p10", title:"Learning through listening: a scoping review of podcast use in medical education", authors:"Kelly JM, Perseghin A, Dow AW, Trivedi SP, Rodman A, Berk J.", journal:"Acad Med. 2022;97(7):1079–1085", doi:"10.1097/ACM.0000000000004565", topic:"Education" },
  { id:"p11", title:"Emergency medical systems in low- and middle-income countries: recommendations for action", authors:"Kobusingye OC, Hyder AA, Bishai D, Hicks ER, Mock C, Joshipura M.", journal:"Bull World Health Organ. 2005;83(8):626–631", doi:"", topic:"Prehospital" },
  { id:"p12", title:"Deciding to lead: a qualitative study of women leaders in emergency medicine", authors:"Guptill M, Reibling ET, Clem K.", journal:"Int J Emerg Med. 2018;11(1):47", doi:"10.1186/s12245-018-0206-7", topic:"Leadership" },
  { id:"p13", title:"Increasing women in leadership in global health", authors:"Downs JA, Reif LK, Hokororo A, Fitzgerald DW.", journal:"Acad Med. 2014;89(8):1103–1107", doi:"10.1097/ACM.0000000000000369", topic:"Leadership" },
  { id:"p14", title:"Telemedicine adoption and prospects in sub-Saharan Africa: a systematic review", authors:"Agbeyangi AO, Lukose JM.", journal:"Healthcare (Basel). 2025;13(7):762", doi:"10.3390/healthcare13070762", topic:"Digital health" }
];

/* ---------- Seeded topic records ----------
   These are subject headings, not attributed work. No invented
   authors, no invented findings, no invented institutions.
   Each renders a DEMO badge until a member publishes into it. */

export const CASES = [
  { id:"c1", demo:true, cat:"Airway", title:"The difficult airway without a video laryngoscope", teaser:"Structured approach to predicted difficulty when direct laryngoscopy and a bougie are what you have." },
  { id:"c2", demo:true, cat:"Trauma", title:"Chest trauma in a district hospital", teaser:"Assessment and decompression when CT and a thoracic surgeon are both hours away." },
  { id:"c3", demo:true, cat:"Paediatrics", title:"Status epilepticus after two doses of benzodiazepine", teaser:"Second-line agents, and what to do when the recommended one is out of stock." },
  { id:"c4", demo:true, cat:"Obstetrics", title:"Postpartum haemorrhage on a referral ward", teaser:"Balloon tamponade, transfusion, and deciding when to stop resuscitating and start moving." },
  { id:"c5", demo:true, cat:"ECG", title:"ECG of the week: the diagnosis you cannot miss at night", teaser:"Structured interpretation, the common traps, and what actually changes management." },
  { id:"c6", demo:true, cat:"Critical care", title:"Sepsis with two litres of fluid and no vasopressor", teaser:"Prioritising when the recommended pathway assumes resources the department does not have." }
];

export const STORIES = [
  { id:"s1", demo:true, cat:"Resilience", title:"When the generator fails mid-resuscitation", teaser:"What departments change after the lights go out, and what they wish they had changed before." },
  { id:"s2", demo:true, cat:"Resident life", title:"The night you are the most senior person in the department", teaser:"Six months into residency, and the trauma call is yours." },
  { id:"s3", demo:true, cat:"Rural practice", title:"Two hours from the referral hospital", teaser:"What you can and cannot do when transfer is the only definitive treatment." },
  { id:"s4", demo:true, cat:"Career", title:"Coming home after fellowship abroad", teaser:"Bringing subspecialty training back to a public hospital, and what does not transfer." }
];

export const INNOVATIONS = [
  { id:"i1", demo:true, cat:"Prehospital", title:"Dispatch that works on 2G", teaser:"Ambulance coordination where data coverage is unreliable or absent." },
  { id:"i2", demo:true, cat:"Education", title:"Offline ultrasound training on a phone", teaser:"Recorded probe movements paired with annotated findings, usable without connectivity." },
  { id:"i3", demo:true, cat:"Logistics", title:"Low-cost cold-chain monitoring", teaser:"Temperature logging with SMS alerting for district pharmacy stock." },
  { id:"i4", demo:true, cat:"AI", title:"Triage decision support and the local data problem", teaser:"Why models validated elsewhere need African data before they can be trusted here." }
];

export const MEDIA = [
  { id:"m1", demo:true, kind:"Podcast", n:"01", title:"Building an emergency department from nothing", teaser:"The first year of a new ED — staffing, triage, the arguments, and what the textbooks leave out.", status:"In production", audio:"", video:"" },
  { id:"m2", demo:true, kind:"Podcast", n:"02", title:"The airway you were not expecting", teaser:"Difficult airway management where a video laryngoscope is not an option.", status:"In production", audio:"", video:"" },
  { id:"m3", demo:true, kind:"Podcast", n:"03", title:"Publishing from a district hospital", teaser:"How frontline clinicians turn what they see into research other departments can use.", status:"In production", audio:"", video:"" },
  { id:"m4", demo:true, kind:"Interview", n:"—", title:"Building EMS from the ground up", teaser:"Designing national ambulance dispatch protocols from a standing start.", status:"Planned", audio:"", video:"" }
];

export const EVENTS = [
  { id:"e1", kind:"Conference", title:"AfCEM 2026 — 8th African Conference on Emergency Medicine", when:"11–13 November 2026", where:"Arusha, Tanzania", teaser:"The continental gathering where AVE Forum is being presented.", url:"https://afcem.or.tz/" },
  { id:"e2", demo:true, kind:"Webinar", title:"Pan-African airway management webinar", when:"To be scheduled", where:"Online", teaser:"Difficult airway algorithms adapted for low-resource emergency departments." },
  { id:"e3", demo:true, kind:"Journal club", title:"Monthly journal club — first session", when:"To be scheduled", where:"Online", teaser:"Live appraisal of one paper from the Research Spotlight, recorded and archived." }
];

export const COUNTRIES = ["Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic","Chad","Comoros","Congo","Côte d'Ivoire","DR Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea","Eswatini","Ethiopia","Gabon","The Gambia","Ghana","Guinea","Guinea-Bissau","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","São Tomé and Príncipe","Senegal","Seychelles","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe","Outside Africa"];

export const ROLES = ["Emergency physician","EM resident / registrar","Medical officer","Emergency nurse","Paramedic / EMT","Researcher","Educator / faculty","Medical or nursing student","Policy / health systems","Other"];

export const INTERESTS = ["Listening and learning","Contributing a case or article","Contributing a podcast episode","Research collaboration or mentorship","Her Voice in EM — nominating or being featured","Representing my country","Partnership or funding"];
