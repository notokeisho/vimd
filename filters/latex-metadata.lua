-- filters/latex-metadata.lua
-- Extract metadata from AGU journal format LaTeX and insert as HTML at document start

local extracted = {
  title = nil,
  authors = nil,
  affiliations = {},
  corresponding = nil,
  keypoints = {},
  abstract = nil
}

-- Convert \affil{n} to <sup>n</sup>
local function process_affil(text)
  return text:gsub('\\affil{(%d+)}', '<sup>%1</sup>')
end

-- Extract title and abstract from Meta (pandoc processes these as metadata)
function Meta(meta)
  if meta.title then
    extracted.title = pandoc.utils.stringify(meta.title)
  end
  if meta.abstract then
    extracted.abstract = pandoc.utils.stringify(meta.abstract)
  end
  return meta
end

function RawBlock(el)
  if el.format:match('latex') or el.format:match('tex') then
    local text = el.text

    -- Extract \authors{...}
    local authors = text:match('\\authors%s*{(.+)}')
    if authors then
      extracted.authors = process_affil(authors)
    end

    -- Extract \affiliation{n}{...}
    local affil_num, affil_text = text:match('\\affiliation%s*{(%d+)}%s*{(.+)}')
    if affil_num and affil_text then
      extracted.affiliations[tonumber(affil_num)] = affil_text
    end

    -- Extract \correspondingauthor{name}{email}
    local corr_name, corr_email = text:match('\\correspondingauthor%s*{([^}]+)}%s*{([^}]+)}')
    if corr_name and corr_email then
      extracted.corresponding = { name = corr_name, email = corr_email }
    end

    -- Extract \begin{keypoints}...\end{keypoints}
    local keypoints_content = text:match('\\begin{keypoints}(.-)\\end{keypoints}')
    if keypoints_content then
      -- Extract each \item content
      for item in keypoints_content:gmatch('\\item%s*([^\n]+)') do
        -- Trim whitespace
        item = item:gsub('^%s*', ''):gsub('%s*$', '')
        if item ~= '' then
          table.insert(extracted.keypoints, item)
        end
      end
    end
  end
  return el
end

function Pandoc(doc)
  local header_blocks = {}

  -- 1. Title
  if extracted.title then
    table.insert(header_blocks, pandoc.RawBlock('html',
      '<h1 class="vimd-title">' .. extracted.title .. '</h1>'))
  end

  -- 2. Authors
  if extracted.authors then
    table.insert(header_blocks, pandoc.RawBlock('html',
      '<div class="vimd-authors">' .. extracted.authors .. '</div>'))
  end

  -- 3. Affiliations
  if next(extracted.affiliations) then
    local affil_html = '<div class="vimd-affiliations">'
    -- Sort by affiliation number
    local sorted_keys = {}
    for k in pairs(extracted.affiliations) do
      table.insert(sorted_keys, k)
    end
    table.sort(sorted_keys)
    for _, i in ipairs(sorted_keys) do
      local affil = extracted.affiliations[i]
      affil_html = affil_html .. '<div class="vimd-affiliation"><sup>' .. i .. '</sup> ' .. affil .. '</div>'
    end
    affil_html = affil_html .. '</div>'
    table.insert(header_blocks, pandoc.RawBlock('html', affil_html))
  end

  -- 4. Corresponding author
  if extracted.corresponding then
    local corr_html = '<div class="vimd-corresponding">Corresponding author: '
      .. extracted.corresponding.name .. ' (<a href="mailto:' .. extracted.corresponding.email .. '">'
      .. extracted.corresponding.email .. '</a>)</div>'
    table.insert(header_blocks, pandoc.RawBlock('html', corr_html))
  end

  -- 5. Key Points
  if #extracted.keypoints > 0 then
    local kp_html = '<div class="vimd-keypoints"><h2>Key Points</h2><ul>'
    for _, item in ipairs(extracted.keypoints) do
      kp_html = kp_html .. '<li>' .. item .. '</li>'
    end
    kp_html = kp_html .. '</ul></div>'
    table.insert(header_blocks, pandoc.RawBlock('html', kp_html))
  end

  -- 6. Abstract
  if extracted.abstract then
    table.insert(header_blocks, pandoc.RawBlock('html',
      '<div class="vimd-abstract"><h2>Abstract</h2><p>' .. extracted.abstract .. '</p></div>'))
  end

  -- Insert at document start (in reverse order to maintain order)
  for i = #header_blocks, 1, -1 do
    table.insert(doc.blocks, 1, header_blocks[i])
  end

  return doc
end

return {
  { Meta = Meta },
  { RawBlock = RawBlock },
  { Pandoc = Pandoc }
}
