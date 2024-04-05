module UTF8Filter
  def utf8_encode (input)
    input.force_encoding("UTF-8")
  end
end

Liquid::Template.register_filter(UTF8Filter)