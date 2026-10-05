const { test, expect } = require('@playwright/test');

// CI tests the checked-out public site only. Do not generate real analytics,
// submit newsletter/customer information, or open payment sessions.
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    const allowed = ['127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com'];
    return allowed.includes(url.hostname) ? route.continue() : route.abort();
  });
});

async function checkHorizontalFit(page) {
  const dimensions = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
}

for (const viewport of [{width:1280,height:900}, {width:390,height:844}]) {
  test(`resource referral journey at ${viewport.width}px`, async ({page}, testInfo) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto('/resources.html');
    expect(response.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    // Exercise the keyboard route from the hero rather than a direct hash jump.
    const share = page.getByRole('link', {name:'Sharing resources with a new homeowner? Start here.'});
    await share.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#share$/);
    await expect(page.locator('#share-title')).toBeInViewport();
    await checkHorizontalFit(page);

    const cards = page.locator('#share .resource-card');
    const boxes = await cards.evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
    }));
    expect(boxes).toHaveLength(3);
    for(let i=0;i<boxes.length;i++) {
      expect(boxes[i].left).toBeGreaterThanOrEqual(0);
      expect(boxes[i].right).toBeLessThanOrEqual(viewport.width);
      if(i) {
        if(viewport.width<981) expect(boxes[i].top).toBeGreaterThanOrEqual(boxes[i-1].bottom);
        else expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i-1].right);
      }
    }
    await page.locator('#share').screenshot({path:testInfo.outputPath(`referral-${viewport.width}.png`)});
    await page.getByRole('link', {name:'Open the free printable log →'}).click();
    await expect(page).toHaveURL(/home-maintenance-log-printable\.html#blank-log$/);
    await expect(page.locator('#blank-log')).toBeVisible();
    await checkHorizontalFit(page);

    await page.goto('/resources.html');
    if(viewport.width<981) {
      const menu = page.getByRole('button',{name:'Menu',exact:true});
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded','true');
    }
    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Starter Binder',exact:true}).click();
    await expect(page).toHaveURL(/packages\.html$/);
    await expect(page.getByRole('heading',{name:'The complete 44-page Starter Binder is $9.99.'})).toBeVisible();
    await expect(page.getByRole('link',{name:'Get the 44-Page Binder — $9.99',exact:true}).first()).toHaveAttribute('href','https://home-routine-guide.kit.com/products/19-starter-binder?step=checkout');
    await checkHorizontalFit(page);
    await page.screenshot({path:testInfo.outputPath(`product-${viewport.width}.png`)});
    expect(errors).toEqual([]);
  });
}

test('referral section remains readable in print', async ({page}, testInfo) => {
  await page.setViewportSize({width:794,height:1123});
  await page.goto('/resources.html#share');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({media:'print'});
  await expect(page.getByRole('link', {name:'Skip to content', includeHidden:true})).toBeHidden();
  await expect(page.locator('#share')).toBeVisible();
  await checkHorizontalFit(page);
  await page.locator('#share').screenshot({path:testInfo.outputPath('referral-print.png')});
  await page.pdf({path:testInfo.outputPath('resources-print.pdf'),format:'A4',printBackground:true});
});

for (const width of [1280, 390]) {
  test(`free calendar can be found, filled and printed at ${width}px`, async ({page}, testInfo) => {
    await page.setViewportSize({width, height:900});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await checkHorizontalFit(page);
    await page.screenshot({path:testInfo.outputPath(`calendar-entry-${width}.png`)});
    await page.getByRole('link', {name:'Print the free calendar', exact:true}).click();
    await expect(page).toHaveURL(/home-maintenance-calendar-printable\.html#calendar-worksheet$/);
    await expect(page.locator('#calendar-title')).toBeInViewport();
    await page.goto('/resources.html#free-worksheets');
    await page.getByRole('link', {name:'Open the free maintenance calendar →'}).click();
    await expect(page).toHaveURL(/home-maintenance-calendar-printable\.html#calendar-worksheet$/);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#calendar-title')).toBeInViewport();
    await checkHorizontalFit(page);
    await expect(page.locator('.calendar-month textarea')).toHaveCount(12);
    await page.getByLabel('Year', {exact:true}).fill('2026');
    await page.getByLabel('January tasks, due dates and who', {exact:true}).fill('Example only: read equipment manual / Jan 15 / owner');
    await page.getByLabel('December tasks, due dates and who', {exact:true}).fill('Example only: review next-year dates / Dec 15 / owner');
    await page.locator('#calendar-year').focus();
    await page.evaluate(() => window.scrollTo({top:document.querySelector('#calendar-worksheet').getBoundingClientRect().top + window.scrollY - 100,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`calendar-${width}.png`)});
    await page.evaluate(() => { window.print = () => { window.calendarPrintCalled = true; }; });
    const print = page.getByRole('button', {name:'Print or save calendar'});
    await print.focus();
    await page.keyboard.press('Enter');
    expect(await page.evaluate(() => window.calendarPrintCalled)).toBe(true);
    if (width === 1280) {
      await page.setViewportSize({width:703,height:1032});
      await page.emulateMedia({media:'print'});
      await expect(print).toBeHidden();
      await expect(page.locator('.site-header')).toBeHidden();
      await expect(page.locator('#calendar-worksheet')).toBeVisible();
      // The longest permitted note must remain printable without clipping.
      const december = page.getByLabel('December tasks, due dates and who', {exact:true});
      await december.fill('W'.repeat(100));
      expect(await december.evaluate(e => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      await december.fill('Example only: review next-year dates / Dec 15 / owner');
      await page.pdf({path:testInfo.outputPath('calendar-print.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true});
    }
    expect(errors).toEqual([]);
    await page.reload();
    await expect(page.locator('#calendar-year')).toHaveValue('');
    await expect(page.locator('#calendar-january')).toHaveValue('');
  });
}

for (const width of [1280, 390]) {
  test(`free warranty sheet discovery and print at ${width}px`, async ({page}, testInfo) => {
    await page.setViewportSize({width,height:900});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('/resources.html');
    const entry=page.getByRole('link',{name:'Print the free warranty tracker →',exact:true});
    await entry.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/home-warranty-tracker-printable\.html#warranty-worksheet$/);
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('#warranty-sheet-title')).toBeInViewport();
    await checkHorizontalFit(page);
    await expect(page.locator('.warranty-field')).toHaveCount(12);
    await page.locator('.warranty-sheet').screenshot({path:testInfo.outputPath(`warranty-${width}.png`)});
    await page.evaluate(()=>{window.print=()=>{window.warrantyPrintCalled=true;};});
    const print=page.getByRole('button',{name:'Print blank warranty tracker'});
    await print.focus();
    await page.keyboard.press('Enter');
    expect(await page.evaluate(()=>window.warrantyPrintCalled)).toBe(true);
    if(width===1280){
      await page.emulateMedia({media:'print'});
      await expect(print).toBeHidden();
      await expect(page.locator('.site-header')).toBeHidden();
      for(const format of ['A4','Letter']){
        await page.pdf({path:testInfo.outputPath(`warranty-${format}.pdf`),format,printBackground:true});
      }
    }
    expect(errors).toEqual([]);
  });
}
