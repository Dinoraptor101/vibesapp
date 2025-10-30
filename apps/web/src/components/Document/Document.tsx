import type React from 'react';
import { Link } from 'react-router-dom';
import './document.css';
// Add imports for images
import postCreation from '../../assets/images/documentation/post-creation.png';
import postsGrid from '../../assets/images/documentation/posts-grid.png';
import profileView from '../../assets/images/documentation/profile-view.png';

/**
 * @component Document
 * @description A comprehensive documentation component that displays information about Vibes platform,
 * including its purpose, functionality, code of conduct, legal information, and support details.
 * The component is organised into sections with anchor links for easy navigation and accessibility.
 *
 * @returns {JSX.Element} A structured document layout with sections for platform information.
 */
const Document: React.FC = () => {
  return (
    <div className="document">
      <h2 id="what-is-vibes" className="heading2">
        What is Vibes{' '}
        <a href="#what-is-vibes" className="link-icon anchor">
          🔗
        </a>
      </h2>
      <p className="paragraph">
        Inspired by the six whisper users, Vibes is where{' '}
        <strong>
          <em>local connections</em>
        </strong>{' '}
        are formed through wholesome content and shared interests.
      </p>

      <p className="centered-message">No ads, No bots, and No algorithms.</p>

      <h3 className="heading4">How Does It Work?</h3>
      <div className="content-with-image">
        <div className="text-content">
          <p className="paragraph">
            Vibes is a merit-based system that rewards positive contributions while discouraging
            negative behavior. Different vibe levels unlock various platform features, and you can
            always check your vibe bar to see available benefits at each level.
          </p>
        </div>
        <div className="screenshot-container">
          <img src={profileView} alt="Vibe System Interface" className="documentation-image" />
          <p className="image-caption">Vibe System Interface - Shows blue and red vibe states</p>
        </div>
      </div>

      <h3 className="heading4">Tips for Managing Your Vibe</h3>
      <ul className="unordered-list">
        <li className="list-item">
          <strong>Be Thoughtful with Your Posts:</strong> Every post you create impacts your vibe.
          Ensure your contributions are meaningful and add value to the community.
        </li>
        <li className="list-item">
          <strong>Engage Respectfully:</strong> Replies are encouraged as they are a great way to
          engage with others, but remember to keep your interactions constructive.
        </li>
        <li className="list-item">
          <strong>Spread Positivity:</strong> Giving likes acts as an endorsement of content you
          enjoy. The author will gain vibes for it.
        </li>
        <li className="list-item">
          <strong>Be Mindful of Dislikes:</strong> Use dislikes sparingly and only when necessary.
          They act as a report feature. At a small cost to your own vibe, the author will lose more
          vibes, and the post may be automatically removed.
        </li>
        <li className="list-item">
          <strong>Appreciate Recognition:</strong> Receiving likes from others is a sign of
          appreciation for your contributions. This encourages you to contribute content that
          matters to the community.
        </li>
        <li className="list-item">
          <strong>Daily Upkeep:</strong> Checking in at least once a day helps you recover lost
          vibes passively and also grants you more contribution rights.
        </li>
        <li className="list-item">
          <strong>Think Before You DM:</strong> Direct messages are costly, so do not spam them.
          Engage in group chats (which cost nothing) before requesting a private conversation to
          increase the likelihood of approval.
        </li>
        <li className="list-item">
          <strong>Delete Posts Wisely:</strong> If you are in a pinch, delete less useful posts to
          recover some vibes. This is a great way to manage your contributions and vibe levels.
        </li>
        <li className="list-item">
          <strong>Hoarding is Futile:</strong> Your vibe has a maximum limit. We discourage farming
          them beyond a certain point.
        </li>
        <li className="list-item">
          <strong>Self-Accountability:</strong> Only you can see your vibes. It is a tool for
          self-accountability and not competition.
        </li>
      </ul>

      <h3 className="heading4">Content Creation</h3>
      <div className="content-with-image">
        <div className="text-content">
          <p className="paragraph">
            The <strong>Post Creation</strong> feature includes rich text formatting, allowing for
            link support and the ability to write entire articles. Whether you&apos;re sharing quick
            thoughts or crafting long-form content, the interface adapts to your needs.
          </p>
          <p className="paragraph">
            Once a post is created, it provides a conversation box that can function as either a
            real-time group chat or a comment section with nested replies. You can choose to
            subscribe selectively at the message level or the group chat level, and you also have
            the option to respond with another post.
          </p>
        </div>
        <div className="screenshot-container">
          <img src={postCreation} alt="Post Creation Interface" className="documentation-image" />
          <p className="image-caption">Creating a new post on Vibes</p>
        </div>
      </div>

      <h3 className="heading4">Navigation and Features</h3>
      <div className="content-with-image">
        <div className="text-content">
          <p className="paragraph">
            dmRequestCost: -10, The <strong>Home Feed</strong> offers intuitive controls to
            customise your viewing experience. The <strong>Distance Range</strong> slider lets you
            filter posts based on proximity to your location, making it easy to focus on your local
            community or expand your reach when desired.
          </p>
          <p className="paragraph">
            Toggle the <strong>Replies</strong> switch to seamlessly alternate between main posts
            and conversation threads. This helps you either focus on new content or dive deep into
            ongoing discussions, putting you in control of your content consumption.
          </p>
          <p className="paragraph">
            We believe in universal access, which is why <strong>Vibes</strong> is built as a
            responsive web platform rather than a traditional mobile app. The{' '}
            <strong>Posts Grid</strong> automatically adapts to your screen size - from multi-column
            layouts on desktop to single-column views on mobile devices. This approach ensures you
            get a great experience on any device without the hassle of app stores or platform
            restrictions.
          </p>
        </div>
        <div className="screenshot-container">
          <img src={postsGrid} alt="Home Feed" className="documentation-image" />
          <p className="image-caption">Home Feed with customisable controls</p>
        </div>
      </div>

      <h3 className="heading4">Theme Customisation</h3>
      <p className="paragraph">
        Based on extensive user feedback and consultation with night owls, we have carefully crafted
        three distinct themes that prioritise both aesthetics and eye comfort:
      </p>
      <ul className="unordered-list">
        <li className="list-item">
          <strong>Light Theme:</strong>{' '}
          <span
            className="color-square color-square-light"
            style={{ backgroundColor: '#f8f8f8' }}
          ></span>
          <span className="color-label">(pearl white)</span>
          Background with{' '}
          <span className="color-square" style={{ backgroundColor: '#000000' }}></span>
          <span className="color-label">(pure black)</span>
          text, optimised for daytime use. Interface elements use our signature{' '}
          <span className="color-square" style={{ backgroundColor: '#61dafb' }}></span>
          <span className="color-label">(bright cyan)</span>
          accent colour for interactive elements.
        </li>
        <li className="list-item">
          <strong>Dim Theme:</strong>{' '}
          <span className="color-square" style={{ backgroundColor: '#333333' }}></span>
          <span className="color-label">(charcoal)</span>
          Background with{' '}
          <span
            className="color-square color-square-light"
            style={{ backgroundColor: '#f8f8f8' }}
          ></span>
          <span className="color-label">(pearl white)</span>
          text. The softer{' '}
          <span className="color-square" style={{ backgroundColor: '#56c95a' }}></span>
          <span className="color-label">(sage green)</span>
          accent colour reduces eye strain.
        </li>
        <li className="list-item">
          <strong>Dark Theme:</strong>{' '}
          <span className="color-square" style={{ backgroundColor: '#000000' }}></span>
          <span className="color-label">(pure black)</span>
          True black background with{' '}
          <span className="color-square" style={{ backgroundColor: '#4caf50' }}></span>
          <span className="color-label">(forest green)</span>
          accent colour, designed for OLED displays.
        </li>
      </ul>
      <p className="paragraph">
        All theme transitions are smoothly animated to prevent jarring changes that could disrupt
        your viewing experience. The colour palette for each theme was extensively tested for
        accessibility, meeting WCAG 2.1 contrast guidelines to ensure readability for users with
        different visual needs.
      </p>

      <h2 id="support-and-updates" className="heading2">
        Support and Updates{' '}
        <a href="#support-and-updates" className="link-icon anchor">
          🔗
        </a>
      </h2>
      <p className="paragraph">
        We welcome your ideas, support, and concerns! Join our{' '}
        <a href="https://t.me/vibesapp" target="_blank" rel="noopener noreferrer">
          Developer Channel on Telegram
        </a>{' '}
        to discuss them and stay updated on the latest changes.
      </p>
      <p className="paragraph">
        If you encounter any issues or bugs, please report them through our dedicated{' '}
        <Link to="/issue">Issue Report Portal</Link>, which will submit a ticket directly to
        development for faster resolution.
      </p>

      <h2 id="code-of-conduct" className="heading2">
        Code of Conduct{' '}
        <a href="#code-of-conduct" className="link-icon anchor">
          🔗
        </a>
      </h2>
      <ul className="unordered-list">
        <li className="list-item">
          <strong>Be Respectful:</strong> Be kind to everyone! Do not be mean, pretend to be someone
          else, or share others&apos; private information such as addresses or telephone numbers.
        </li>
        <li className="list-item">
          <strong>Keep it Clean:</strong> Share content that is appropriate for everyone. Do not
          post anything unsavoury, frightening or inappropriate like pornography.
        </li>
        <li className="list-item">
          <strong>Stay Legal:</strong> Only share things you own or have permission to post. Don’t
          share nudes or promote illegal stuff like selling drugs.
        </li>
        <li className="list-item">
          <strong>No Violence:</strong> Don’t threaten anyone. If you do, we might have to tell the
          police and share your information to keep everyone safe.
        </li>
      </ul>

      <h2 id="legal-stuff" className="heading2">
        Legal Stuff{' '}
        <a href="#legal-stuff" className="link-icon anchor">
          🔗
        </a>
      </h2>
      <h3 className="heading4">Privacy Policy Highlights</h3>
      <ul className="unordered-list">
        <li className="list-item">
          <strong>Account Information:</strong> You will be assigned a user token, called
          &quot;Pigeon.&quot; This token helps you manage your session across devices or restore
          your login if needed. Be sure to keep it secure—once issued, it cannot be changed.
        </li>
        <li className="list-item">
          <strong>Content Submitted:</strong> We store the content you create and share, like posts,
          comments, and messages, to provide a seamless experience.
        </li>
        <li className="list-item">
          <strong>Interactions and Location Data:</strong> We collect data on how you interact with
          posts and comments. Location data is required to create your account and show you relevant
          content. We only collect your general location once every 30 days, we do not track you.
        </li>
        <li className="list-item">
          <strong>Technical Information:</strong> We only collect the technical data necessary to
          serve you the content you need and will never sell your data because we respect your
          privacy.
        </li>
      </ul>

      <h3 className="heading4">User Content and Intellectual Property</h3>
      <ul className="unordered-list">
        <li className="list-item">
          <strong>User Content:</strong> By sharing content on Vibes, you give us a non-exclusive,
          royalty-free licence to use, modify, and display it. Some of your content may be publicly
          displayed, and Vibes does not control or assume responsibility for it.
        </li>
        <li className="list-item">
          <strong>Intellectual Property:</strong> All copyrights and trademarks belong to their
          rightful owners. Our services and all related content are protected by copyright and
          trademark laws.
        </li>
        <li className="list-item">
          <strong>Acceptable Use:</strong> Please follow all applicable laws and regulations.
          Prohibited actions include discriminatory, defamatory, or harassing behaviour.
        </li>
        <li className="list-item">
          <strong>Advertisement:</strong> You are allowed to promote your own small business or
          self-employment. However, sending paid advertisements, promoting businesses on behalf of
          someone else, or running ads for entities you don’t personally own is prohibited.
        </li>
      </ul>

      <hr className="horizontal-rule" />
    </div>
  );
};

export default Document;
