# The name of the extension.
extension_name := vwof

# The UUID of the extension.
extension_uuid := vwof@drev.com

#brand = abrowser
brand = firefox

# The name of the profile dir where the extension can be installed.
#profile_dir := tmly9v55.default
#profile_dir := 6zmefmpw.default
profile_dir := 44rjgep5.default

# The zip application to be used.
ZIP := zip

# The target location of the build and build files.
bin_dir := ../bin

# The target XPI file.
xpi_file := $(bin_dir)/$(extension_name).xpi

# The type of operating system this make command is running on.
os_type := $(patsubst darwin%,darwin,$(shell echo $(OSTYPE)))
os_type = linux-gnu

# The location of the extension profile.
ifeq ($(os_type), darwin)
  profile_location := \
    ~/Library/Application\ Support/Firefox/Profiles/$(profile_dir)/extensions/$(extension_uuid)
else
  ifeq ($(os_type), linux-gnu)
    profile_location := \
      ~/.mozilla/$(brand)/$(profile_dir)/extensions/$(extension_uuid)
  else
    profile_location := \
      "$(subst \,\\,$(APPDATA))\\Mozilla\\Firefox\\Profiles\\$(profile_dir)\\extensions\\$(extension_uuid)"
  endif
endif

# The temporary location where the extension tree will be copied and built.
build_dir := $(bin_dir)/build

# The install.rdf file.
install_rdf := install.rdf

# The chrome.manifest file.
chrome_manifest := chrome.manifest

# The modules (JSM) dir.
modules_dir := modules

# The defaults dir.
defaults_dir := defaults

# The preferences dir.
preferences_dir := $(defaults_dir)/preferences

content_dir := content

# This builds the extension XPI file.
.PHONY: all
all: $(xpi_file)
	@echo
	@echo "Build finished successfully."
	@echo

# This cleans all temporary files and directories created by 'make'.
.PHONY: clean
clean:
	@rm -rf $(build_dir)
	@rm -f $(xpi_file)
	@echo "Cleanup is done."


# The includes are added after the targets because we want this file to contain
# the default (first) target.
include chrome/Makefile.in
include modules/Makefile.in

# The sources for the XPI file. Uses variables defined in the included
# Makefiles.
xpi_built := $(build_dir)/$(install_rdf) \
             $(build_dir)/$(chrome_manifest) \
	     $(addprefix $(build_dir)/,$(sources)) \
             $(addprefix $(build_dir)/,$(modules_sources)) \
             $(build_dir)/$(preferences_dir)/$(extension_name).js

xpi_built_no_dir := $(subst $(build_dir)/,,$(xpi_built))

# This builds everything except for the actual XPI, and then it copies it to the
# specified profile directory, allowing a quick update that requires no install.
.PHONY: install
install: $(build_dir) $(xpi_built)
	@echo "Installing in profile folder: $(profile_location)"
	@if [ ! -x $(profile_location) ]; \
  then \
    mkdir $(profile_location); \
  fi
	@cp -Rf --parents $(build_dir)/* $(profile_location)
	@echo "Installing in profile folder. Done!"
	@echo

$(xpi_file): $(build_dir) $(xpi_built)
	@echo "Creating XPI file."
	@cd $(build_dir); $(ZIP) ../$(xpi_file) $(xpi_built_no_dir)
	@echo "Creating XPI file. Done!"

$(build_dir)/$(modules_dir)/%: $(modules_dir)/% $(build_dir)/$(modules_dir)
	@cp -f $< $@

$(build_dir)/$(preferences_dir)/%: \
  $(preferences_dir)/% $(build_dir)/$(preferences_dir)
	@cp -f $< $@

$(build_dir)/$(defaults_dir)/%: $(defaults_dir)/% $(build_dir)/$(defaults_dir)
	@cp -f $< $@

$(build_dir)/$(preferences_dir): $(build_dir)/$(defaults_dir)
	@if [ ! -x $(build_dir)/$(preferences_dir) ]; \
  then \
    mkdir $(build_dir)/$(preferences_dir); \
  fi

$(build_dir)/$(defaults_dir):
	@if [ ! -x $(build_dir)/$(defaults_dir) ]; \
  then \
    mkdir $(build_dir)/$(defaults_dir); \
  fi

$(build_dir)/%: %
	@cp -f $< $@

$(build_dir):
	@if [ ! -x $(build_dir) ]; \
  then \
    mkdir $(build_dir); \
  fi

$(build_dir)/$(modules_dir):
	@if [ ! -x $(build_dir)/$(modules_dir) ]; \
  then \
    mkdir $(build_dir)/$(modules_dir); \
  fi

$(build_dir)/$(source_root)/$(content_dir):
	@if [ ! -x $(build_dir)/$(source_root)/$(content_dir) ]; \
  then \
    mkdir $(build_dir)/$(content_dir); \
  fi

