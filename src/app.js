import { version } from '../package.json';
import RouteState from 'route-state';
import handleError from 'handle-error-web';
import curry from 'lodash.curry';
import kebabCase from 'lodash.kebabcase';
import domToImage from 'dom-to-image';

var formWired = false;
var faviconEl = document.querySelector('link[rel~=icon]');
var textFieldEl = document.getElementById('text-field');
var fontSizeSliderEl = document.getElementById('font-size-slider');
var fontSizeLabelEl = document.getElementById('font-size-label');
var altBgToggle = document.getElementById('alt-bg');
var altBgOverlayEl = document.getElementById('alt-bg-overlay');
var altBgControlsEl = document.getElementById('alt-bg-controls');
var altBgOpacitySliderEl = document.getElementById('alt-bg-opacity-slider');
var altBgOpacityLabelEl = document.getElementById('alt-bg-opacity-label');
var downloadLinkEl = document.getElementById('download-link');
// var imageSizeFieldEl = document.querySelector('input[name='image-size-field']:checked');
var emojiTextEl = document.getElementById('emoji-text');
var buildButtonEl = document.getElementById('build-button');
var previewStageEl = document.getElementById('preview-stage');
var resultImageEl = document.getElementById('result-image');
var resultImageElSm = document.getElementById('result-image-sm');
var resultImageElXs = document.getElementById('result-image-xs');
var resultImageElSmDk = document.getElementById('result-image-sm-dk');
var resultImageElXsDk = document.getElementById('result-image-xs-dk');
var resultSectionEl = document.querySelector('.result');
var resultInstructionEl = document.getElementById('result-instruction');
var darkModeToggle = document.getElementById('dark-theme-toggle');

var routeState = RouteState({
  followRoute,
  windowObject: window,
  propsToCoerceToBool: ['altBg'],
});

(function go() {
  window.onerror = reportTopLevelError;
  renderVersion();
  routeState.routeFromHash();
})();

function followRoute({
  text = 'lol',
  fontSize = 128,
  altBg = false,
  altBgOpacity = 100,
}) {
  updateForm({ text, fontSize, altBg, altBgOpacity });
  renderPreview({ text, fontSize, altBgOpacity });
  wireForm();
}

function updateForm({ text, fontSize, altBg, altBgOpacity }) {
  textFieldEl.value = text;
  fontSizeSliderEl.value = fontSize;
  fontSizeLabelEl.textContent = fontSize;
  altBgToggle.checked = altBg;
  altBgControlsEl.style.visibility = altBg ? 'visible' : 'hidden';
  altBgOverlayEl.style.display = altBg ? 'inherit' : 'none';
  altBgOpacitySliderEl.value = altBgOpacity;
  altBgOpacityLabelEl.textContent = altBgOpacity;
}

function renderPreview({ text, fontSize, altBgOpacity }) {
  emojiTextEl.style.fontSize = fontSize + 'px';
  emojiTextEl.textContent = text;
  altBgOverlayEl.style.opacity = (altBgOpacity / 100);
}

function wireForm() {
  if (formWired) {
    return;
  }

  textFieldEl.addEventListener(
    'keyup',
    curry(updateRoute)('text', textFieldEl)
  );
  fontSizeSliderEl.addEventListener(
    'input',
    curry(updateRoute)('fontSize', fontSizeSliderEl)
  );
  fontSizeSliderEl.addEventListener('change', updateFontSizeLabel);

  altBgToggle.addEventListener(
    'change',
    (e) => {
      e.composing;
      routeState.addToRoute({ altBg: altBgToggle.checked });
    }
  );

  altBgOpacitySliderEl.addEventListener(
    'input',
    curry(updateRoute)('altBgOpacity', altBgOpacitySliderEl)
  );
  altBgOpacitySliderEl.addEventListener('change', updateAltBgOpacityLabel);

  buildButtonEl.addEventListener('click', onBuildClick);

  document.documentElement.classList.toggle('alt-theme', localStorage.getItem('preferAltTheme'));

  darkModeToggle.addEventListener('click', () => {
    var preferAltTheme = document.documentElement.classList.toggle('alt-theme');
    localStorage.setItem('preferAltTheme', preferAltTheme);
  });

  formWired = true;
}

function updateRoute(prop, inputEl, e) {
  e.composing;
  routeState.addToRoute({ [prop]: inputEl.value });
}

function updateFontSizeLabel() {
  fontSizeLabelEl.textContent = fontSizeSliderEl.value;
}

function updateAltBgOpacityLabel() {
  altBgOpacityLabelEl.textContent = altBgOpacitySliderEl.value;
}

function onBuildClick() {
  resultSectionEl.classList.remove('hidden');
  domToImage
    .toPng(previewStageEl)
    .then(curry(renderResult)(kebabCase(textFieldEl.value)))
    .catch(handleError);
}

function renderResult(name, dataURL) {
  resultImageEl.src = dataURL;
  resultImageElSm.src = dataURL;
  resultImageElXs.src = dataURL;
  resultImageElSmDk.src = dataURL;
  resultImageElXsDk.src = dataURL;

  downloadLinkEl.download = name;
  downloadLinkEl.href = dataURL;

  faviconEl.href = dataURL;

  resultInstructionEl.classList.remove('hidden');
}

function renderVersion() {
  document.getElementById('version-info').textContent = version;
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
