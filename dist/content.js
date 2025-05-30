(() => {
  // src/utils/linkedin-extractor.ts
  var LinkedInExtractor = class {
    /**
     * Extract profile data from LinkedIn page
     * Tries JSON-LD blocks first, falls back to DOM parsing
     */
    static extractProfile() {
      try {
        const jsonProfile = this.extractFromJsonLD();
        if (jsonProfile) return jsonProfile;
        return this.extractFromDOM();
      } catch (error) {
        console.error("Profile extraction failed:", error);
        return null;
      }
    }
    static extractFromJsonLD() {
      var _a, _b;
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || "");
          if (data["@type"] === "Person" || data.name) {
            return {
              fullName: data.name || "",
              headline: data.jobTitle || data.headline || "",
              location: ((_a = data.address) == null ? void 0 : _a.addressLocality) || "",
              company: ((_b = data.worksFor) == null ? void 0 : _b.name) || "",
              position: data.jobTitle || "",
              profileUrl: window.location.href,
              imageUrl: data.image || "",
              about: data.description || ""
            };
          }
        } catch (e) {
          continue;
        }
      }
      const profileData = this.extractFromProfileCard();
      if (profileData) return profileData;
      return null;
    }
    static extractFromProfileCard() {
      var _a, _b, _c, _d;
      try {
        const voyagerData = window.voyager;
        if (voyagerData == null ? void 0 : voyagerData.profile) {
          const profile = voyagerData.profile;
          return {
            fullName: profile.firstName + " " + profile.lastName,
            headline: profile.headline,
            location: profile.locationName,
            profileUrl: window.location.href,
            imageUrl: profile.pictureUrl,
            about: profile.summary
          };
        }
        const apolloCache = window.__APOLLO_STATE__;
        if (apolloCache) {
          const profileKeys = Object.keys(apolloCache).filter(
            (key) => key.includes("Profile:") || key.includes("Person:")
          );
          if (profileKeys.length > 0) {
            const profileData = apolloCache[profileKeys[0]];
            return {
              fullName: `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
              headline: profileData.headline,
              location: profileData.geoLocationName,
              profileUrl: window.location.href,
              imageUrl: (_d = (_c = (_b = (_a = profileData.picture) == null ? void 0 : _a["com.linkedin.common.VectorImage"]) == null ? void 0 : _b.artifacts) == null ? void 0 : _c[0]) == null ? void 0 : _d.fileIdentifyingUrlPathSegment
            };
          }
        }
      } catch (error) {
        console.error("Profile card extraction failed:", error);
      }
      return null;
    }
    static extractFromDOM() {
      var _a, _b, _c, _d, _e, _f;
      try {
        const profileSection = document.querySelector(".pv-top-card") || document.querySelector(".ph5.pb5") || document.querySelector('[data-section="profile"]');
        if (!profileSection) return null;
        const nameElement = profileSection.querySelector("h1") || document.querySelector("h1.text-heading-xlarge") || document.querySelector('[data-anonymize="person-name"]');
        const fullName = ((_a = nameElement == null ? void 0 : nameElement.textContent) == null ? void 0 : _a.trim()) || "";
        const headlineElement = profileSection.querySelector(".text-body-medium.break-words") || document.querySelector('[data-anonymize="headline"]') || document.querySelector(".pv-top-card--headline");
        const headline = ((_b = headlineElement == null ? void 0 : headlineElement.textContent) == null ? void 0 : _b.trim()) || "";
        const locationElement = profileSection.querySelector(".text-body-small.inline.t-black--light.break-words") || document.querySelector('[data-anonymize="location"]');
        const location = ((_c = locationElement == null ? void 0 : locationElement.textContent) == null ? void 0 : _c.trim()) || "";
        const imageElement = profileSection.querySelector("img.pv-top-card-profile-picture__image") || document.querySelector(".profile-photo-edit__preview") || document.querySelector('img[data-anonymize="headshot-photo"]');
        const imageUrl = (imageElement == null ? void 0 : imageElement.getAttribute("src")) || "";
        const aboutSection = document.querySelector("#about") || document.querySelector('[data-section="aboutSection"]');
        let about = "";
        if (aboutSection) {
          const aboutText = ((_d = aboutSection.nextElementSibling) == null ? void 0 : _d.querySelector(".pv-shared-text-with-see-more")) || ((_e = aboutSection.parentElement) == null ? void 0 : _e.querySelector(".display-flex.full-width"));
          about = ((_f = aboutText == null ? void 0 : aboutText.textContent) == null ? void 0 : _f.trim()) || "";
        }
        const experience = this.extractExperienceFromDOM();
        const currentJob = experience == null ? void 0 : experience[0];
        const company = (currentJob == null ? void 0 : currentJob.company) || "";
        const position = (currentJob == null ? void 0 : currentJob.title) || headline;
        return {
          fullName,
          headline,
          location,
          company,
          position,
          profileUrl: window.location.href,
          imageUrl,
          about,
          experience
        };
      } catch (error) {
        console.error("DOM extraction failed:", error);
        return null;
      }
    }
    static extractExperienceFromDOM() {
      var _a;
      try {
        const experienceSection = document.querySelector("#experience") || document.querySelector('[data-section="experienceSection"]');
        if (!experienceSection) return [];
        const experienceItems = [];
        const experienceList = ((_a = experienceSection.parentElement) == null ? void 0 : _a.querySelectorAll("li.artdeco-list__item")) || document.querySelectorAll(".pvs-list__item--line-separated");
        experienceList.forEach((item) => {
          var _a2, _b, _c, _d;
          try {
            const titleElement = item.querySelector(".mr1.hoverable-link-text.t-bold") || item.querySelector('[data-anonymize="job-title"]');
            const title = ((_a2 = titleElement == null ? void 0 : titleElement.textContent) == null ? void 0 : _a2.trim()) || "";
            const companyElement = item.querySelector(".t-normal") || item.querySelector('[data-anonymize="company-name"]');
            const company = ((_b = companyElement == null ? void 0 : companyElement.textContent) == null ? void 0 : _b.trim()) || "";
            const durationElement = item.querySelector(".t-black--light.t-normal") || item.querySelector('[data-anonymize="duration"]');
            const duration = ((_c = durationElement == null ? void 0 : durationElement.textContent) == null ? void 0 : _c.trim()) || "";
            const locationElement = item.querySelector(".t-black--light.t-normal.mt1") || item.querySelector('[data-anonymize="job-location"]');
            const location = ((_d = locationElement == null ? void 0 : locationElement.textContent) == null ? void 0 : _d.trim()) || "";
            if (title && company) {
              experienceItems.push({
                title,
                company,
                duration,
                location
              });
            }
          } catch (e) {
            console.warn("Failed to extract experience item:", e);
          }
        });
        return experienceItems;
      } catch (error) {
        console.error("Experience extraction failed:", error);
        return [];
      }
    }
    /**
     * Get LinkedIn profile ID from URL
     */
    static getProfileId() {
      const match = window.location.pathname.match(/\/in\/([^\/]+)/);
      return match ? match[1] : null;
    }
    /**
     * Check if current page is a LinkedIn profile
     */
    static isLinkedInProfile() {
      return window.location.hostname.includes("linkedin.com") && window.location.pathname.startsWith("/in/");
    }
  };

  // src/utils/proxycurl.ts
  var PROXYCURL_API_KEY = "YOUR_PROXYCURL_API_KEY";
  var ProxycurlService = class {
    /**
     * Fetch profile data from Proxycurl API
     */
    static async fetchProfile(linkedinUrl) {
      try {
        const response = await fetch("https://nubela.co/proxycurl/api/v2/linkedin", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${PROXYCURL_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            linkedin_profile_url: linkedinUrl,
            extra: "include",
            github_profile_id: "include",
            facebook_profile_id: "include",
            twitter_profile_id: "include",
            personal_contact_number: "include",
            personal_email: "include",
            inferred_salary: "include",
            skills: "include",
            use_cache: "if-present",
            fallback_to_cache: "on-error"
          })
        });
        if (!response.ok) {
          throw new Error(`Proxycurl API error: ${response.status}`);
        }
        const data = await response.json();
        return this.transformToLinkedInProfile(data, linkedinUrl);
      } catch (error) {
        console.error("Proxycurl fetch failed:", error);
        return null;
      }
    }
    /**
     * Transform Proxycurl response to LinkedInProfile format
     */
    static transformToLinkedInProfile(data, originalUrl) {
      var _a, _b, _c;
      const currentExperience = (_a = data.experiences) == null ? void 0 : _a[0];
      const experience = ((_b = data.experiences) == null ? void 0 : _b.map((exp) => ({
        title: exp.title || "",
        company: exp.company || "",
        duration: this.formatDuration(exp.starts_at, exp.ends_at),
        location: exp.location || "",
        description: exp.description || ""
      }))) || [];
      const education = ((_c = data.education) == null ? void 0 : _c.map(
        (edu) => `${edu.degree_name} ${edu.field_of_study} at ${edu.school}`
      ).join(", ")) || "";
      return {
        fullName: data.full_name || "",
        headline: data.headline || "",
        location: [data.city, data.country].filter(Boolean).join(", "),
        company: (currentExperience == null ? void 0 : currentExperience.company) || "",
        position: (currentExperience == null ? void 0 : currentExperience.title) || data.occupation || "",
        education,
        profileUrl: originalUrl,
        imageUrl: data.profile_pic_url || "",
        about: data.summary || "",
        experience
      };
    }
    /**
     * Format duration from Proxycurl date objects
     */
    static formatDuration(startDate, endDate) {
      if (!startDate) return "";
      const start = `${this.getMonthName(startDate.month)} ${startDate.year}`;
      if (!endDate) {
        return `${start} - Present`;
      }
      const end = `${this.getMonthName(endDate.month)} ${endDate.year}`;
      return `${start} - ${end}`;
    }
    static getMonthName(month) {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      return months[month - 1] || "";
    }
    /**
     * Check if Proxycurl service is available
     */
    static isAvailable() {
      return !!PROXYCURL_API_KEY && PROXYCURL_API_KEY !== "YOUR_PROXYCURL_API_KEY";
    }
  };

  // src/content.ts
  var ContentScript = class {
    constructor() {
      this.extractedProfile = null;
      this.isExtracting = false;
      this.init();
    }
    init() {
      if (!LinkedInExtractor.isLinkedInProfile()) {
        return;
      }
      console.log("MeetingBrief: LinkedIn profile detected");
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sendResponse);
        return true;
      });
      this.extractProfileData();
      this.observePageChanges();
      this.addBriefButton();
    }
    async handleMessage(message, sendResponse) {
      var _a;
      switch (message.type) {
        case "PROFILE_EXTRACTED":
          sendResponse({ profile: this.extractedProfile });
          break;
        case "CREATE_BRIEF":
          if (!this.extractedProfile) {
            await this.extractProfileData();
          }
          if (this.extractedProfile) {
            chrome.runtime.sendMessage({
              type: "CREATE_BRIEF",
              data: {
                profile: this.extractedProfile,
                notes: ((_a = message.data) == null ? void 0 : _a.notes) || ""
              }
            });
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: "Could not extract profile data" });
          }
          break;
        default:
          sendResponse({ error: "Unknown message type" });
      }
    }
    async extractProfileData() {
      if (this.isExtracting) return;
      this.isExtracting = true;
      try {
        console.log("MeetingBrief: Extracting profile data...");
        let profile = LinkedInExtractor.extractProfile();
        if (!profile || this.isProfileIncomplete(profile)) {
          console.log("MeetingBrief: Profile incomplete, trying Proxycurl fallback...");
          if (ProxycurlService.isAvailable()) {
            const proxycurlProfile = await ProxycurlService.fetchProfile(window.location.href);
            if (proxycurlProfile) {
              profile = this.mergeProfileData(profile, proxycurlProfile);
            }
          }
        }
        this.extractedProfile = profile;
        if (profile) {
          console.log("MeetingBrief: Profile extracted successfully:", profile.fullName);
          chrome.runtime.sendMessage({
            type: "PROFILE_EXTRACTED",
            data: profile
          });
        } else {
          console.warn("MeetingBrief: Failed to extract profile data");
        }
      } catch (error) {
        console.error("MeetingBrief: Profile extraction error:", error);
      } finally {
        this.isExtracting = false;
      }
    }
    isProfileIncomplete(profile) {
      return !profile.fullName || !profile.headline && !profile.position || !profile.company;
    }
    mergeProfileData(primary, fallback) {
      var _a;
      if (!primary) return fallback;
      return {
        fullName: primary.fullName || fallback.fullName,
        headline: primary.headline || fallback.headline,
        location: primary.location || fallback.location,
        company: primary.company || fallback.company,
        position: primary.position || fallback.position,
        education: primary.education || fallback.education,
        profileUrl: primary.profileUrl,
        imageUrl: primary.imageUrl || fallback.imageUrl,
        about: primary.about || fallback.about,
        experience: ((_a = primary.experience) == null ? void 0 : _a.length) ? primary.experience : fallback.experience,
        connections: primary.connections || fallback.connections
      };
    }
    observePageChanges() {
      let currentUrl = window.location.href;
      const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          if (LinkedInExtractor.isLinkedInProfile()) {
            console.log("MeetingBrief: Page navigation detected, re-extracting...");
            setTimeout(() => this.extractProfileData(), 2e3);
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    addBriefButton() {
      const buttonId = "meetingbrief-create-btn";
      const existingButton = document.getElementById(buttonId);
      if (existingButton) {
        existingButton.remove();
      }
      const button = document.createElement("button");
      button.id = buttonId;
      button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
      Create Brief
    `;
      button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0073b1;
      color: white;
      border: none;
      border-radius: 24px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 115, 177, 0.3);
      z-index: 9999;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;
      button.addEventListener("mouseenter", () => {
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 6px 16px rgba(0, 115, 177, 0.4)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "0 4px 12px rgba(0, 115, 177, 0.3)";
      });
      button.addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
      });
      document.body.appendChild(button);
    }
  };
  new ContentScript();
})();
//# sourceMappingURL=content.js.map