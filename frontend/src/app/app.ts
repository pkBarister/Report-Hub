import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

type Page = 'home' | 'templates' | 'workspace' | 'preview';

interface TemplateItem {
  id: string;
  title: string;
  description: string;
}

interface TemplateCategory {
  id: string;
  title: string;
  icon: string;
  templates: TemplateItem[];
}

const MTN_REPORT_CONTENT = `<div class="section-title">CHAPTER 2</div>
<br />
<div class="section-subtitle">A Section Of the Digital Portal</div>
<br />
<div>Sales also did not work alone; we also worked hand in hand with the installation team to ensure that the 72 hour-period I ensured customers was adhered to. If there was any issue that prevented the installation from happening I would follow up with the customer to make sure that he or she is made aware of the mishap and a rescheduling is done immediately on the client's behalf. And even after installation was completed I would call the customers to ensure that the internet connection and the network was working fine without any issues such as latency or buffering. I would also go ahead and direct the customer through how to purchase another data bundle if the first one is exhausted, and again how to switch between any of the choices that is either the non-expiry data bundle or the unlimited data package.</div>
<br />
<br />
<div class="section-title">CHAPTER 3</div>
<br />
<div class="section-subtitle emphasized">Contributions</div>
<br />
<div>I was able to contribute to the organization through the broadcast of the MTN fibre services which will make customers aware of it and pursue it at MTN's official offices even though I won't be active as an agent anymore. Again I was able to bring a lot of people on board who are now actively using MTN's broadband services.</div>
<br />
<div class="section-subtitle emphasized">Challenges</div>
<br />
<div>I faced a lot of resistance from customers regarding the credibility of the MTN Fibre services along with mentions of MTN fraud, which I directed them to the office for further assistance. Some people also had a poor understanding of the fibre technology and I had to go over and explain the fibre infrastructure all over again to clarify all misunderstandings.</div>
<br />
<div>As an agent who was doing most of my activities on field I faced difficulties in working whenever there was a harsh weather condition such as heavy rainfall or scorch days, again long distance walking also impacted how much productivity we could achieve during a particular work period as we got exhausted really quickly.</div>
<br />
<div>We also faced competition from other ISPs such as Telecel who had also invested in the fibre technology and was also actively broadcasting the service. Apart from these, other challenges we faced was with respect to our daily transportation and feeding. We had to take care of these ourselves, thus, proving to be another financial burden on us.</div>
<br />
<br />
<div class="section-subtitle emphasized">Skills and Experience Gained</div>
<br />
<div>This internship also allowed me to improve on my communication skills as I was engaging with strangers on a daily basis. It also made me learn how to persuade, negotiate and convince people and generally how to pitch an idea to someone. It boosted my confidence; time management skills; and gave me a proper understanding of telecom infrastructure and how field engineers coordinate and take on installation tasks.</div>
<br />
<br />
<div class="section-title">CHAPTER 4</div>
<br />
<div class="section-subtitle emphasized">Conclusion</div>
<br />
<div>In conclusion, the supervised industrial attachment proved to be very helpful and gave the students of Takoradi Technical University the opportunity to engage with professionals and gain real-world experience into their various fields and interests of study.</div>`;

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewChecked {
  @ViewChild('editor') editor?: ElementRef<HTMLDivElement>;

  // ──────────────────────────────────────────────
  // Service injection
  // ──────────────────────────────────────────────
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  // ──────────────────────────────────────────────
  // Navigation state
  // ──────────────────────────────────────────────
  currentPage: Page = 'home';
  initialContent: string | null = null;
  private pendingEditorContent = false;

  // ──────────────────────────────────────────────
  // UI state
  // ──────────────────────────────────────────────
  searchQuery = '';
  activeCategory = 'all';
  isDictating = false;
  leftSidebarOpen = true;
  rightSidebarOpen = true;

  // ──────────────────────────────────────────────
  // AI assistant state (Templates page)
  // ──────────────────────────────────────────────
  assistantNotes = '';
  isMatchingTemplate = false;
  assistantError = '';

  // ──────────────────────────────────────────────
  // Smart-input state (Workspace page)
  // ──────────────────────────────────────────────
  smartInputText = '';
  isRefining = false;
  refineError = '';

  // ──────────────────────────────────────────────
  // Export state
  // ──────────────────────────────────────────────
  isExportingPptx = false;
  exportError = '';

  // ──────────────────────────────────────────────
  // Speech recognition
  // ──────────────────────────────────────────────
  private recognition: any = null;

  // ──────────────────────────────────────────────
  // Static data
  // ──────────────────────────────────────────────
  readonly chapters = [
    { id: 'cover', title: 'TTU Cover Page', icon: 'TTU', complete: true },
    { id: 'acknowledgement', title: 'Acknowledgement', icon: 'DOC', complete: true },
    { id: 'intro', title: '1. Introduction', icon: 'DOC', active: true },
    { id: 'lit-review', title: '2. Literature Review', icon: 'DOC' },
    { id: 'methodology', title: '3. Methodology', icon: 'DOC' },
    { id: 'results', title: '4. Results', icon: 'DOC' },
    { id: 'conclusion', title: '5. Conclusion', icon: 'DOC' },
    { id: 'references', title: 'References', icon: 'DOC' },
  ];

  readonly mediaLibrary = [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop',
      name: 'Network_Topology.png',
      date: 'Today',
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop',
      name: 'Global_Architecture.jpg',
      date: 'Yesterday',
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop',
      name: 'Data_Analysis_Chart.png',
      date: 'Oct 12',
    },
  ];

  readonly templateCategories: TemplateCategory[] = [
    {
      id: 'field-work',
      title: 'Field Work Reports',
      icon: 'briefcase',
      templates: [
        { id: 'fw-1', title: 'Daily Field Activity Log', description: 'Standard template for logging daily activities during field work tasks.' },
        { id: 'fw-2', title: 'Site Inspection Report', description: 'Comprehensive site inspection checklist and observation notes format.' },
        { id: 'fw-3', title: 'End of Field Work Summary', description: 'Final report summarizing overall findings, issues, and tasks completed.' },
      ],
    },
    {
      id: 'software',
      title: 'Software Engineering Reports',
      icon: 'code',
      templates: [
        { id: 'se-1', title: 'Sprint Retrospective', description: 'Document what went well and what needs improvement in your sprint.' },
        { id: 'se-2', title: 'Technical Architecture Design', description: 'Detailed specification for software architecture and systems design.' },
        { id: 'se-3', title: 'Bug/Incident Post-Mortem', description: 'Analysis of production incidents, root causes, and resolutions.' },
        { id: 'se-4', title: 'Internship Project Report', description: 'End-of-term summary of software projects handled during an internship.' },
      ],
    },
    {
      id: 'accounting',
      title: 'Accounting Reports',
      icon: 'calculator',
      templates: [
        { id: 'ac-1', title: 'Monthly Expense Report', description: 'Detailed breakdown of monthly operational expenses and budget tracking.' },
        { id: 'ac-2', title: 'Quarterly Financial Analysis', description: 'In-depth review of financial health, revenue, and future projections.' },
        { id: 'ac-3', title: 'Audit Summary', description: 'Standard format for summarizing findings from internal or external audits.' },
      ],
    },
    {
      id: 'hospitality',
      title: 'Hospitality Reports',
      icon: 'coffee',
      templates: [
        { id: 'ho-1', title: 'Shift Handover Log', description: 'Important notes, guest complaints, and status updates passed between shifts.' },
        { id: 'ho-2', title: 'Event Management Summary', description: 'Post-event report detailing attendance, guest feedback, and finances.' },
        { id: 'ho-3', title: 'Guest Feedback Analysis', description: 'Compilation and analysis of feedback from hotel or restaurant guests.' },
      ],
    },
  ];

  readonly lineNumbers = Array.from({ length: 60 }, (_, index) => index + 1);

  // ──────────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────────
  navigate(page: Page, content: string | null = null): void {
    this.initialContent = content;
    this.currentPage = page;
    this.pendingEditorContent = page === 'workspace' && !!content;
    // Clear any lingering errors when navigating away
    this.assistantError = '';
    this.refineError = '';
    this.exportError = '';
  }

  // ──────────────────────────────────────────────
  // Template filtering
  // ──────────────────────────────────────────────
  filteredCategories(): TemplateCategory[] {
    return this.templateCategories
      .filter((category) => this.activeCategory === 'all' || category.id === this.activeCategory)
      .map((category) => ({
        ...category,
        templates: category.templates.filter((template) => {
          const query = this.searchQuery.trim().toLowerCase();
          return !query || template.title.toLowerCase().includes(query) || template.description.toLowerCase().includes(query);
        }),
      }))
      .filter((category) => category.templates.length > 0);
  }

  setSearchQuery(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  // ──────────────────────────────────────────────
  // AI: Match Template (Templates page)
  // ──────────────────────────────────────────────
  matchTemplate(): void {
    const notes = this.assistantNotes.trim();
    if (!notes) {
      // Fallback: use built-in MTN template
      this.navigate('workspace', MTN_REPORT_CONTENT);
      return;
    }

    this.isMatchingTemplate = true;
    this.assistantError = '';

    this.api.generateAIReport({ userNotes: notes }).subscribe({
      next: (res) => {
        this.isMatchingTemplate = false;
        // Convert the Tiptap JSON into plain HTML for the contenteditable editor
        const html = this.tiptapToHtml(res.transformedContent as any);
        this.navigate('workspace', html || MTN_REPORT_CONTENT);
      },
      error: (err) => {
        this.isMatchingTemplate = false;
        this.assistantError = err?.error?.error || 'AI service unavailable – using sample template.';
        // Graceful degradation: still open workspace with sample
        this.navigate('workspace', MTN_REPORT_CONTENT);
      },
    });
  }

  /** Legacy alias kept for template cards that still call useTemplate() */
  useTemplate(): void {
    this.navigate('workspace', MTN_REPORT_CONTENT);
  }

  // ──────────────────────────────────────────────
  // AI: Refine (Workspace smart-input)
  // ──────────────────────────────────────────────
  refineContent(): void {
    const prompt = this.smartInputText.trim();
    if (!prompt || !this.editor?.nativeElement) return;

    const currentHtml = this.editor.nativeElement.innerHTML;
    this.isRefining = true;
    this.refineError = '';

    this.api.generateAIReport({ userNotes: prompt, templateContent: { rawHtml: currentHtml } }).subscribe({
      next: (res) => {
        this.isRefining = false;
        const html = this.tiptapToHtml(res.transformedContent as any);
        if (html && this.editor?.nativeElement) {
          this.editor.nativeElement.innerHTML = html;
        }
        this.smartInputText = '';
      },
      error: (err) => {
        this.isRefining = false;
        this.refineError = err?.error?.error || 'Refine failed. Please try again.';
      },
    });
  }

  // ──────────────────────────────────────────────
  // Export: PDF (browser print)
  // ──────────────────────────────────────────────
  printDocument(): void {
    window.print();
  }

  // ──────────────────────────────────────────────
  // Export: PowerPoint
  // ──────────────────────────────────────────────
  exportPptx(): void {
    if (!this.editor?.nativeElement) return;

    const editorHtml = this.editor.nativeElement.innerHTML;
    const tiptapDoc = this.htmlToTiptap(editorHtml);
    const title = 'Internship Report Presentation';

    this.isExportingPptx = true;
    this.exportError = '';

    this.api.exportPptx(tiptapDoc, title).subscribe({
      next: (blob) => {
        this.isExportingPptx = false;
        // Trigger browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.pptx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isExportingPptx = false;
        this.exportError = 'PPTX export failed. Please try again.';
        console.error('PPTX Export Error:', err);
      },
    });
  }

  // ──────────────────────────────────────────────
  // Dictate (Web Speech API)
  // ──────────────────────────────────────────────
  toggleDictate(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    if (this.isDictating) {
      this.recognition?.stop();
      this.isDictating = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript: string = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join(' ');
      if (this.editor?.nativeElement) {
        this.editor.nativeElement.innerHTML += `<div>${transcript}</div>`;
      }
    };

    this.recognition.onerror = () => {
      this.isDictating = false;
    };

    this.recognition.onend = () => {
      this.isDictating = false;
    };

    this.recognition.start();
    this.isDictating = true;
  }

  // ──────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────
  ngAfterViewChecked(): void {
    if (this.pendingEditorContent && this.editor?.nativeElement && this.initialContent) {
      this.editor.nativeElement.innerHTML = this.initialContent;
      this.pendingEditorContent = false;
    }
  }

  // ──────────────────────────────────────────────
  // Helpers: Tiptap JSON ↔ HTML
  // ──────────────────────────────────────────────

  /** Recursively convert a Tiptap document JSON into basic HTML */
  private tiptapToHtml(doc: any): string {
    if (!doc || !doc.content) return '';
    return doc.content.map((node: any) => this.nodeToHtml(node)).join('');
  }

  private nodeToHtml(node: any): string {
    if (!node) return '';
    const inner = node.text ?? (node.content?.map((c: any) => this.nodeToHtml(c)).join('') ?? '');

    switch (node.type) {
      case 'heading': {
        const level = node.attrs?.level ?? 2;
        return `<h${level}>${inner}</h${level}>`;
      }
      case 'paragraph':
        return `<div>${inner}</div><br/>`;
      case 'bulletList':
        return `<ul>${inner}</ul>`;
      case 'orderedList':
        return `<ol>${inner}</ol>`;
      case 'listItem':
        return `<li>${inner}</li>`;
      case 'text':
        return node.text ?? '';
      default:
        return inner;
    }
  }

  /** Build a minimal Tiptap doc JSON from raw HTML (for PPTX export) */
  private htmlToTiptap(html: string): object {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content: object[] = [];

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent ?? '').trim();
        if (text) content.push({ type: 'paragraph', content: [{ type: 'text', text }] });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent ?? '').trim();
        if (!text) return;

        if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
          content.push({ type: 'heading', attrs: { level: parseInt(tag[1], 10) }, content: [{ type: 'text', text }] });
        } else {
          content.push({ type: 'paragraph', content: [{ type: 'text', text }] });
        }
      }
    });

    return { type: 'doc', content };
  }
}
